const { JobWorkSession, User, Job, Lead } = require("../models");
const { Op } = require("sequelize");
const moment = require("moment");

/**
 * Get timesheet data for an employee within a date range
 * GET /api/timesheets/employee/:employeeId?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
exports.getEmployeeTimesheet = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;

    if (!employeeId) {
      return res.status(400).json({ success: false, message: "Employee ID is required" });
    }

    // Verify authorized: Admin or the employee themselves
    if (req.user.role !== 'admin' && req.user.id != employeeId) {
        return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    const whereClause = { userId: employeeId };
    
    if (startDate && endDate) {
      whereClause.startTime = {
        [Op.between]: [
          moment.utc(startDate).startOf("day").toDate(),
          moment.utc(endDate).endOf("day").toDate(),
        ],
      };
    } else if (startDate) {
        whereClause.startTime = {
            [Op.gte]: moment.utc(startDate).startOf("day").toDate(),
        };
    }

    const sessions = await JobWorkSession.findAll({
      where: whereClause,
      include: [
        { model: Job, as: "job", attributes: ["id", "notes"] },
        { model: Lead, as: "lead", attributes: ["id", "name", "address", "serviceType"] },
      ],
      order: [["startTime", "ASC"]],
    });

    if (sessions.length === 0) {
      return res.json({
        success: true,
        data: {
          employeeId,
          period: { startDate, endDate },
          timesheet: [],
          summary: {
            totalHours: 0,
            totalOvertimeHours: 0,
            daysWorked: 0,
          },
        },
      });
    }

    // Aggregation Logic: Group by Date (UTC)
    const dailyData = {};

    sessions.forEach((session) => {
      const dateKey = moment.utc(session.startTime).format("YYYY-MM-DD");
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: dateKey,
          startTime: session.startTime,
          endTime: session.endTime || null,
          totalWorkedSeconds: 0,
          sessions: [],
        };
      }

      // Update earliest start and latest end for the day
      if (new Date(session.startTime) < new Date(dailyData[dateKey].startTime)) {
        dailyData[dateKey].startTime = session.startTime;
      }
      if (session.endTime && (!dailyData[dateKey].endTime || new Date(session.endTime) > new Date(dailyData[dateKey].endTime))) {
        dailyData[dateKey].endTime = session.endTime;
      }

      dailyData[dateKey].totalWorkedSeconds += parseInt(session.duration || 0);
      dailyData[dateKey].sessions.push(session);
    });

    // Final Processing: Break Calculation & Overtime
    const timesheet = Object.values(dailyData).map((day) => {
      const totalHours = parseFloat((day.totalWorkedSeconds / 3600).toFixed(2));
      
      // Calculate Break Time: Time between sessions
      let breakSeconds = 0;
      for (let i = 0; i < day.sessions.length - 1; i++) {
        const currentEnd = day.sessions[i].endTime;
        const nextStart = day.sessions[i + 1].startTime;
        if (currentEnd && nextStart) {
          const gap = moment.utc(nextStart).diff(moment.utc(currentEnd), 'seconds');
          if (gap > 0) breakSeconds += gap;
        }
      }

      return {
        date: day.date,
        dayOfWeek: moment.utc(day.date).format("dddd"),
        startTime: day.startTime,
        endTime: day.endTime,
        totalHours: totalHours,
        breakHours: parseFloat((breakSeconds / 3600).toFixed(2)),
        isOvertime: totalHours > 8,
        overtimeHours: totalHours > 8 ? parseFloat((totalHours - 8).toFixed(2)) : 0,
        sessions: day.sessions.map(s => ({
            id: s.id,
            jobId: s.jobId,
            leadId: s.leadId,
            startTime: s.startTime,
            endTime: s.endTime,
            duration: s.duration,
            jobNotes: s.job ? s.job.notes : null,
            leadName: s.lead ? s.lead.name : "N/A",
            leadAddress: s.lead ? s.lead.address : null,
            serviceType: s.lead ? s.lead.serviceType : null
        }))
      };
    });

    // Period Totals
    const totalPeriodWorked = timesheet.reduce((sum, day) => sum + day.totalHours, 0);
    const totalPeriodOvertime = timesheet.reduce((sum, day) => sum + day.overtimeHours, 0);

    res.json({
      success: true,
      data: {
        employeeId,
        period: {
          startDate,
          endDate,
        },
        timesheet,
        summary: {
          totalHours: parseFloat(totalPeriodWorked.toFixed(2)),
          totalOvertimeHours: parseFloat(totalPeriodOvertime.toFixed(2)),
          daysWorked: timesheet.length,
        },
      },
    });
  } catch (error) {
    console.error("Get timesheet error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch timesheet data" });
  }
};
