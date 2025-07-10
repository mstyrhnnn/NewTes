import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserPaper1723466405432 implements MigrationInterface {
    name = 'CreateUserPaper1723466405432'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "paper_id" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "paper_number" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "paper_number"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "paper_id"`);
    }

}
