import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUniqueIndexEmailPhoneNumber1715535185414 implements MigrationInterface {
    name = 'CreateUniqueIndexEmailPhoneNumber1715535185414'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX "user_email_unique_index" ON "users" ("email") WHERE deleted_at IS NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "user_phone_number_unique_index" ON "users" ("phone_number") WHERE deleted_at IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."user_phone_number_unique_index"`);
        await queryRunner.query(`DROP INDEX "public"."user_email_unique_index"`);
    }

}
