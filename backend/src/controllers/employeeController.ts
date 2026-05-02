import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { ApiResponse, EmployeeCache, OutlookSyncRequest, PaginatedResponse } from '../types';

/**
 * Get all cached employees
 */
export const getAllEmployees = async (
  req: Request,
  res: Response<ApiResponse<PaginatedResponse<EmployeeCache>>>,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const department = req.query.department as string;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (department) {
      where.department = { contains: department, mode: 'insensitive' };
    }

    const [employees, total] = await Promise.all([
      prisma.employeeCache.findMany({
        where,
        skip,
        take: limit,
        orderBy: { lastName: 'asc' }
      }),
      prisma.employeeCache.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        data: employees,
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
 * Get a single employee by ID
 */
export const getEmployeeById = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<EmployeeCache>>,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const employee = await prisma.employeeCache.findUnique({
      where: { id }
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Sync employees from Outlook/Microsoft Graph
 * Note: This is a placeholder implementation. In production, integrate with Microsoft Graph API
 */
export const syncFromOutlook = async (
  req: Request<{}, {}, OutlookSyncRequest>,
  res: Response<ApiResponse<{ synced: number; updated: number; failed: number }>>,
  next: NextFunction
) => {
  try {
    const { forceRefresh = false } = req.body;

    // Check if sync is needed (skip if last sync was recent and not forced)
    if (!forceRefresh) {
      const recentSync = await prisma.employeeCache.findFirst({
        where: {
          lastSyncedAt: {
            gte: new Date(Date.now() - 3600000) // Last hour
          }
        }
      });

      if (recentSync) {
        return res.json({
          success: true,
          message: 'Employees were recently synced. Use forceRefresh=true to sync again.',
          data: { synced: 0, updated: 0, failed: 0 }
        });
      }
    }

    // Fetch employees from Outlook/Microsoft Graph
    // NOTE: This is a placeholder. In production, use Microsoft Graph API
    const outlookEmployees = await fetchFromMicrosoftGraph();

    let synced = 0;
    let updated = 0;
    let failed = 0;

    for (const outlookUser of outlookEmployees) {
      try {
        const existingEmployee = await prisma.employeeCache.findUnique({
          where: { email: outlookUser.mail }
        });

        const employeeData = {
          email: outlookUser.mail,
          firstName: outlookUser.givenName,
          lastName: outlookUser.surname,
          displayName: outlookUser.displayName,
          jobTitle: outlookUser.jobTitle,
          department: outlookUser.department,
          officeLocation: outlookUser.officeLocation,
          mobilePhone: outlookUser.mobilePhone,
          businessPhones: outlookUser.businessPhones ? JSON.stringify(outlookUser.businessPhones) : null,
          lastSyncedAt: new Date()
        };

        if (existingEmployee) {
          await prisma.employeeCache.update({
            where: { id: existingEmployee.id },
            data: employeeData
          });
          updated++;
        } else {
          await prisma.employeeCache.create({
            data: employeeData
          });
          synced++;
        }
      } catch (error) {
        console.error(`Failed to sync employee ${outlookUser.mail}:`, error);
        failed++;
      }
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.user?.userId,
        action: 'UPDATE',
        entityType: 'employee-cache',
        description: `Synced employees from Outlook: ${synced} new, ${updated} updated, ${failed} failed`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      message: 'Employee sync completed successfully',
      data: { synced, updated, failed }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search employees
 */
export const searchEmployees = async (
  req: Request,
  res: Response<ApiResponse<EmployeeCache[]>>,
  next: NextFunction
) => {
  try {
    const query = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const employees = await prisma.employeeCache.findMany({
      where: {
        OR: [
          { email: { contains: query, mode: 'insensitive' } },
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { displayName: { contains: query, mode: 'insensitive' } },
          { department: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: limit,
      orderBy: { lastName: 'asc' }
    });

    res.json({
      success: true,
      data: employees
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get departments list
 */
export const getDepartments = async (
  req: Request,
  res: Response<ApiResponse<string[]>>,
  next: NextFunction
) => {
  try {
    const employees = await prisma.employeeCache.findMany({
      where: {
        department: { not: null }
      },
      select: {
        department: true
      },
      distinct: ['department']
    });

    const departments = employees
      .map(e => e.department)
      .filter((d): d is string => d !== null)
      .sort();

    res.json({
      success: true,
      data: departments
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Fetch employees from Microsoft Graph API
 * NOTE: This is a placeholder. In production, implement proper OAuth2 flow and API integration
 */
async function fetchFromMicrosoftGraph() {
  // Placeholder data for demonstration
  // In production, use @microsoft/microsoft-graph-client

  /*
  Example implementation with Microsoft Graph:

  const client = Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    }
  });

  const response = await client
    .api('/users')
    .select('id,mail,givenName,surname,displayName,jobTitle,department,officeLocation,mobilePhone,businessPhones')
    .get();

  return response.value;
  */

  // Return mock data for now
  return [
    {
      id: '1',
      mail: 'john.doe@example.com',
      givenName: 'John',
      surname: 'Doe',
      displayName: 'John Doe',
      jobTitle: 'Software Engineer',
      department: 'Engineering',
      officeLocation: 'Building A',
      mobilePhone: '+1234567890',
      businessPhones: ['+1234567890']
    }
  ];
}
