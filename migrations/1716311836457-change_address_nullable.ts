import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeAddressNullable1716311836457 implements MigrationInterface {
    name = 'ChangeAddressNullable1716311836457'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "requests" ALTER COLUMN "address" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "requests" ALTER COLUMN "address" SET NOT NULL`);
    }

}
