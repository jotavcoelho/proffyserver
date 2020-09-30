import db from '../database/connection';

import convertHoursToMinutes from '../utils/convertHoursToMinutes';

export default class ClassesController {
  async index(request, response) {
    const { subject, weekday, time } = request.query;

    if(!weekday || !subject || !time)
      return response.status(400).json({
        error: 'Missing filters',
      });

    const timeInMinutes = convertHoursToMinutes(time);

    const classes = await db('classes')
      .whereExists(function() {
        this.select('class_schedule.*')
          .from('class_schedule')
          .whereRaw('`class_schedule`.`class_id` = `classes`.`id`')
          .whereRaw('`class_schedule`.`weekday` = ??', [Number(weekday)])
          .whereRaw('`class_schedule`.`from` <= ??', [timeInMinutes])
          .whereRaw('`class_schedule`.`to` > ??', [timeInMinutes])
      })
      .where('classes.subject', '=', subject)
      .join('users', 'classes.user_id', '=', 'users.id')
      .select(['classes.*', 'users.*']);

    return response.json(classes);
  }

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