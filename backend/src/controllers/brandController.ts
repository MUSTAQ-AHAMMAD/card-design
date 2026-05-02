import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import {
  CreateBrandDTO,
  UpdateBrandDTO,
  CreateBrandAssetDTO,
  ApiResponse,
  PaginatedResponse,
  Brand,
  BrandWithAssets
} from '../types';

/**
 * Get all brands with pagination and filtering
 */
export const getAllBrands = async (
  req: Request,
  res: Response<ApiResponse<PaginatedResponse<BrandWithAssets>>>,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [brands, total] = await Promise.all([
      prisma.brand.findMany({
        where,
        skip,
        take: limit,
        include: {
          assets: {
            where: { deletedAt: null, isActive: true }
          },
          _count: {
            select: { templates: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.brand.count({ where })
    ]);

    const brandsWithCount = brands.map(brand => ({
      ...brand,
      templateCount: brand._count.templates
    }));

    res.json({
      success: true,
      data: {
        data: brandsWithCount as any,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single brand by ID
 */
export const getBrandById = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<BrandWithAssets>>,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const brand = await prisma.brand.findFirst({
      where: { id, deletedAt: null },
      include: {
        assets: {
          where: { deletedAt: null, isActive: true },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { templates: true }
        }
      }
    });

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    const brandWithCount = {
      ...brand,
      templateCount: brand._count.templates
    };

    res.json({
      success: true,
      data: brandWithCount as any
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new brand
 */
export const createBrand = async (
  req: Request<{}, {}, CreateBrandDTO>,
  res: Response<ApiResponse<Brand>>,
  next: NextFunction
) => {
  try {
    const { name, logoUrl, primaryColor, secondaryColor, description, website } = req.body;

    // Check if brand name already exists
    const existingBrand = await prisma.brand.findFirst({
      where: { name, deletedAt: null }
    });

    if (existingBrand) {
      return res.status(400).json({
        success: false,
        message: 'A brand with this name already exists'
      });
    }

    const brand = await prisma.brand.create({
      data: {
        name,
        logoUrl,
        primaryColor: primaryColor || '#3b82f6',
        secondaryColor,
        description,
        website
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.user?.userId,
        action: 'CREATE',
        entityType: 'brand',
        entityId: brand.id,
        description: `Created brand: ${brand.name}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.status(201).json({
      success: true,
      message: 'Brand created successfully',
      data: brand as any
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing brand
 */
export const updateBrand = async (
  req: Request<{ id: string }, {}, UpdateBrandDTO>,
  res: Response<ApiResponse<Brand>>,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const existingBrand = await prisma.brand.findFirst({
      where: { id, deletedAt: null }
    });

    if (!existingBrand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    // Check if new name conflicts with another brand
    if (updates.name && updates.name !== existingBrand.name) {
      const nameConflict = await prisma.brand.findFirst({
        where: {
          name: updates.name,
          id: { not: id },
          deletedAt: null
        }
      });

      if (nameConflict) {
        return res.status(400).json({
          success: false,
          message: 'A brand with this name already exists'
        });
      }
    }

    const brand = await prisma.brand.update({
      where: { id },
      data: updates
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.user?.userId,
        action: 'UPDATE',
        entityType: 'brand',
        entityId: brand.id,
        description: `Updated brand: ${brand.name}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      message: 'Brand updated successfully',
      data: brand as any
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Soft delete a brand
 */
export const deleteBrand = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const brand = await prisma.brand.findFirst({
      where: { id, deletedAt: null }
    });

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    await prisma.brand.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.user?.userId,
        action: 'DELETE',
        entityType: 'brand',
        entityId: id,
        description: `Deleted brand: ${brand.name}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      message: 'Brand deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add an asset to a brand
 */
export const addBrandAsset = async (
  req: Request<{ id: string }, {}, CreateBrandAssetDTO>,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const { id: brandId } = req.params;
    const { name, assetType, fileUrl, mimeType, fileSize, width, height, metadata } = req.body;

    const brand = await prisma.brand.findFirst({
      where: { id: brandId, deletedAt: null }
    });

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    const asset = await prisma.brandAsset.create({
      data: {
        brandId,
        name,
        assetType,
        fileUrl,
        mimeType,
        fileSize,
        width,
        height,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.user?.userId,
        action: 'CREATE',
        entityType: 'brand-asset',
        entityId: asset.id,
        description: `Added asset ${name} to brand: ${brand.name}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.status(201).json({
      success: true,
      message: 'Brand asset added successfully',
      data: asset
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a brand asset
 */
export const deleteBrandAsset = async (
  req: Request<{ id: string; assetId: string }>,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const { id: brandId, assetId } = req.params;

    const asset = await prisma.brandAsset.findFirst({
      where: {
        id: assetId,
        brandId,
        deletedAt: null
      }
    });

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Brand asset not found'
      });
    }

    await prisma.brandAsset.update({
      where: { id: assetId },
      data: { deletedAt: new Date() }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.user?.userId,
        action: 'DELETE',
        entityType: 'brand-asset',
        entityId: assetId,
        description: `Deleted brand asset: ${asset.name}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      message: 'Brand asset deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
