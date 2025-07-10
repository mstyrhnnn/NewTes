import { MigrationInterface, QueryRunner } from "typeorm";

export class SetColorOptionalFleet1716478947720 implements MigrationInterface {
    name = 'SetColorOptionalFleet1716478947720'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fleets" ALTER COLUMN "color" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fleets" ALTER COLUMN "color" SET NOT NULL`);
    }

}
