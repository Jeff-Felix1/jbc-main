SELECT setval(pg_get_serial_sequence('"ClientHistory"',
     'id'), (SELECT MAX(id) FROM "ClientHistory"));