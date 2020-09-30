import db from '../database/connection';

import convertHoursToMinutes from '../utils/convertHoursToMinutes';

export default class ClassesController {
  async create(request, response) {
    const {
      name,
      avatar,
      whatsapp,
      bio,
      subject,
      cost,
      schedule
    } = request.body;

    try {
      const trx = await db.transaction();

      const insertedUserIds = await trx('users').insert({
        name,
        avatar,
        whatsapp,
        bio
      });

      const user_id = insertedUserIds[0];

      const insertedClassIds = await trx('classes').insert({
        subject,
        cost,
        user_id,
      });

      const class_id = insertedClassIds[0];

      const classSchedule = schedule.map(scheduleItem => {
        return {
          class_id,
          weekday: scheduleItem.weekday,
          from: convertHoursToMinutes(scheduleItem.from),
          to: convertHoursToMinutes(scheduleItem.to),
        };
      });

      await trx('class_schedule').insert(classSchedule);

      await trx.commit();

      return response.status(201).send();
    } catch (err) {
      await trx.rollback();

      return response.status(400).json({
        error: err,
      });
    }
  }
}