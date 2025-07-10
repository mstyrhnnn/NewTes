import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEmergencyPhoneNumber1715953811727 implements MigrationInterface {
    name = 'AddEmergencyPhoneNumber1715953811727'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "emergency_phone_number" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "emergency_phone_number"`);
    }

}
