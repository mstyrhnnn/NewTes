import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserOwnerRole1723567500140 implements MigrationInterface {
    name = 'AddUserOwnerRole1723567500140'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fleets" ADD "commission" jsonb NOT NULL DEFAULT '{"transgo":null,"owner":null,"partner":null}'`);
        await queryRunner.query(`ALTER TABLE "fleets" ADD "owner_id" bigint`);
        await queryRunner.query(`ALTER TYPE "public"."users_role_enum" RENAME TO "users_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'driver', 'customer', 'owner')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum" USING "role"::"text"::"public"."users_role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "fleets" ADD CONSTRAINT "FK_05d3adedb827c99fefddd360a69" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fleets" DROP CONSTRAINT "FK_05d3adedb827c99fefddd360a69"`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum_old" AS ENUM('admin', 'driver', 'customer')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum_old" USING "role"::"text"::"public"."users_role_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."users_role_enum_old" RENAME TO "users_role_enum"`);
        await queryRunner.query(`ALTER TABLE "fleets" DROP COLUMN "owner_id"`);
        await queryRunner.query(`ALTER TABLE "fleets" DROP COLUMN "commission"`);
    }

}
