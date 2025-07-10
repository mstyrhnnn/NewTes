import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBusserFeature1752121579400 implements MigrationInterface {
    name = 'CreateBusserFeature1752121579400';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Membuat tipe enum untuk status busser
        await queryRunner.query(`
            CREATE TYPE "public"."busser_status_enum" AS ENUM(
                'peringatan', 
                'butuh_tindakan', 
                'urgent', 
                'tindak_lanjut', 
                'selesai'
            )
        `);

        // 2. Membuat tabel 'busser'
        await queryRunner.query(`
            CREATE TABLE "busser" (
                "id" SERIAL NOT NULL,
                "status_updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "investigator_id" integer,
                "notes" text,
                "order_id" integer,
                "status" "public"."busser_status_enum" NOT NULL DEFAULT 'peringatan',
                CONSTRAINT "REL_a1b2c3d4e5_order_id" UNIQUE ("order_id"),
                CONSTRAINT "PK_f6g7h8i9j0_busser_id" PRIMARY KEY ("id")
            )
        `);

        // 3. Menambahkan foreign key dari tabel 'busser' ke tabel 'orders'
        await queryRunner.query(`
            ALTER TABLE "busser"
            ADD CONSTRAINT "FK_a1b2c3d4e5_order_id" FOREIGN KEY ("order_id")
            REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Perintah untuk membatalkan migrasi (menghapus yang sudah dibuat)
        await queryRunner.query(`ALTER TABLE "busser" DROP CONSTRAINT "FK_a1b2c3d4e5_order_id"`);
        await queryRunner.query(`DROP TABLE "busser"`);
        await queryRunner.query(`DROP TYPE "public"."busser_status_enum"`);
    }
}