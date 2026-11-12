# Stockly backend (Spring Boot 3.4 / Java 21 / MySQL)
Needs: JDK 21, MySQL 8 running locally, IntelliJ IDEA (enable Lombok annotation processing when prompted).

## Environment variables (set them in the IntelliJ run configuration; never commit them)
| Name | Meaning |
|---|---|
| DB_PASSWORD | your MySQL password (required) |
| DB_USERNAME | MySQL user, default `root` |
| JWT_SECRET | random text, at least 32 characters (required) |
| ADMIN_EMAIL, ADMIN_PASSWORD | create the first admin when no users exist (password 8+ characters) |

## Run
1. Run `InventoryApplication`. The `smart_inventory` database is created automatically.
2. `POST http://localhost:8080/api/auth/login` with `{"email":"<ADMIN_EMAIL>","password":"<ADMIN_PASSWORD>"}`.
3. Send the returned token on every other request: `Authorization: Bearer <token>`.

## Tests
`mvn test` (or run the test classes in IntelliJ). They do not need MySQL.

## Database schema (Flyway)
Tables are created by `src/main/resources/db/migration/V1__create_schema.sql` on startup; see `docs/database.md`.
If you ran an earlier version of this project, drop the old development database once so Flyway can start clean:
`DROP DATABASE smart_inventory;` (the app recreates the empty database itself).
Optional sample data: run `docs/sample-data.sql` in MySQL Workbench after the first start.
