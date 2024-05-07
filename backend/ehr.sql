\echo 'Delete and recreate ehr db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE ehr;
CREATE DATABASE ehr;
\connect ehr

\i ehr-schema.sql
\i ehr-seed.sql

\echo 'Delete and recreate ehr_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE ehr_test;
CREATE DATABASE ehr_test;
\connect ehr_test

\i ehr-schema.sql
