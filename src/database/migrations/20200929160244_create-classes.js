
exports.up = function(knex) {
  return knex.schema.createTable('classes', table => {
    table.increments('id').primary();
    table.string('subject').notNullable();
    table.decimal('cost').notNullable();

    table.integer('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('classes');
};
