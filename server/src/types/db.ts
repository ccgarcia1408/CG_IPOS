// Every model method binds its arguments straight into a stored-procedure CALL, so this is the
// set of values mysql2 can send as a placeholder value.
export type SqlParam = string | number | boolean | Date | null | undefined;
