import { MigrationInterface, QueryRunner } from "typeorm";

export class  AddTransactionAndTransferColumns1739499502472 implements MigrationInterface {
    name = ' AddTransactionAndTransferColumns1739499502472'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(`
        //     ALTER TABLE driver_reimburse
        //     ADD COLUMN transaction_proof_url VARCHAR(255),
        //     ADD COLUMN transfer_proof_url VARCHAR(255);
        // `);
    }


    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE driver_reimburse
            DROP COLUMN transaction_proof_url,
            DROP COLUMN transfer_proof_url;
        `);
    }

}
