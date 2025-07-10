import { MigrationInterface, QueryRunner } from "typeorm";

export class  AddToDriverReimburse1739460365099 implements MigrationInterface {
    name = ' AddToDriverReimburse1739460365099'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(`
        //     ALTER TABLE driver_reimburse
        //     ADD COLUMN rejection_reason TEXT,
        //     ADD COLUMN rejected_at TIMESTAMP
        // `);
    }


    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`su
            ALTER TABLE driver_reimburse
            DROP COLUMN rejection_reason,
            DROP COLUMN rejected_at
        `);
    }

}
