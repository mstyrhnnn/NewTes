import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class FleetInspections1739265170865 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
              name: 'fleet_inspections',
              columns: [
                {
                  name: 'id',
                  type: 'bigint',
                  isPrimary: true,
                  isGenerated: true,
                  generationStrategy: 'increment',
                },
                {
                  name: 'fleet_id',
                  type: 'bigint',
                  isNullable: false,
                },
                {
                  name: 'location_id',
                  type: 'bigint',
                  isNullable: false,
                },
                {
                  name: 'inspection_date',
                  type: 'date',
                  isNullable: false,
                },
                {
                  name: 'inspector_name',
                  type: 'varchar',
                  length: '255',
                  isNullable: false,
                },
                {
                  name: 'total_cost',
                  type: 'decimal',
                  precision: 10,
                  scale: 2,
                  isNullable: false,
                  default: 0,
                },
                {
                  name: 'created_at',
                  type: 'timestamp',
                  default: 'now()',
                },
                {
                  name: 'updated_at',
                  type: 'timestamp',
                  default: 'now()',
                },
                {
                  name: 'deleted_at',
                  type: 'timestamp',
                  isNullable: true,
                },
              ],
            }),
            true,
          );
      
          // 2. Buat tabel `inspection_parts`
          await queryRunner.createTable(
            new Table({
              name: 'inspection_parts',
              columns: [
                {
                  name: 'id',
                  type: 'bigint',
                  isPrimary: true,
                  isGenerated: true,
                  generationStrategy: 'increment',
                },
                {
                  name: 'inspection_id',
                  type: 'bigint',
                  isNullable: false,
                },
                {
                  name: 'part_name',
                  type: 'varchar',
                  length: '255',
                  isNullable: false,
                },
                {
                  name: 'cost',
                  type: 'decimal',
                  precision: 10,
                  scale: 2,
                  isNullable: false,
                },
                {
                  name: 'photo_url',
                  type: 'varchar',
                  length: '255',
                  isNullable: true,
                },
                {
                  name: 'created_at',
                  type: 'timestamp',
                  default: 'now()',
                },
                {
                  name: 'updated_at',
                  type: 'timestamp',
                  default: 'now()',
                },
                {
                  name: 'deleted_at',
                  type: 'timestamp',
                  isNullable: true,
                },
              ],
            }),
            true,
          );
      
          // 3. Tambahkan foreign key untuk relasi `fleet_inspections` -> `fleets`
          await queryRunner.createForeignKey(
            'fleet_inspections',
            new TableForeignKey({
              columnNames: ['fleet_id'],
              referencedColumnNames: ['id'],
              referencedTableName: 'fleets',
              onDelete: 'CASCADE',
            }),
          );
      
          // 4. Tambahkan foreign key untuk relasi `fleet_inspections` -> `locations`
          await queryRunner.createForeignKey(
            'fleet_inspections',
            new TableForeignKey({
              columnNames: ['location_id'],
              referencedColumnNames: ['id'],
              referencedTableName: 'locations',
              onDelete: 'CASCADE',
            }),
          );
      
          // 5. Tambahkan foreign key untuk relasi `inspection_parts` -> `fleet_inspections`
          await queryRunner.createForeignKey(
            'inspection_parts',
            new TableForeignKey({
              columnNames: ['inspection_id'],
              referencedColumnNames: ['id'],
              referencedTableName: 'fleet_inspections',
              onDelete: 'CASCADE',
            }),
          );
        }
      
        public async down(queryRunner: QueryRunner): Promise<void> {
          // 1. Hapus foreign key `inspection_parts` -> `fleet_inspections`
          const inspectionPartsTable = await queryRunner.getTable('inspection_parts');
          const inspectionPartsForeignKey = inspectionPartsTable.foreignKeys.find(
            (fk) => fk.columnNames.indexOf('inspection_id') !== -1,
          );
          await queryRunner.dropForeignKey('inspection_parts', inspectionPartsForeignKey);
      
          // 2. Hapus foreign key `fleet_inspections` -> `locations`
          const fleetInspectionsLocationForeignKey = (await queryRunner.getTable('fleet_inspections')).foreignKeys.find(
            (fk) => fk.columnNames.indexOf('location_id') !== -1,
          );
          await queryRunner.dropForeignKey('fleet_inspections', fleetInspectionsLocationForeignKey);
      
          // 3. Hapus foreign key `fleet_inspections` -> `fleets`
          const fleetInspectionsFleetForeignKey = (await queryRunner.getTable('fleet_inspections')).foreignKeys.find(
            (fk) => fk.columnNames.indexOf('fleet_id') !== -1,
          );
          await queryRunner.dropForeignKey('fleet_inspections', fleetInspectionsFleetForeignKey);
      
          // 4. Hapus tabel `inspection_parts`
          await queryRunner.dropTable('inspection_parts');
      
          // 5. Hapus tabel `fleet_inspections`
          await queryRunner.dropTable('fleet_inspections');
    }

}
