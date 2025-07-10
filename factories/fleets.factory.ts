import { setSeederFactory } from "typeorm-extension";
import { FleetsEntity } from "../src/modules/fleets/entities/fleet.entity";
import { FleetTypeEnum } from "../src/modules/fleets/enums/fleet.type.enum";
import { FleetPhotosEntity } from "../src/modules/fleets/entities/fleet-photo.entity";

export default setSeederFactory(FleetsEntity, async (faker) => {
    const typeFlag = faker.number.int(1);
    const type = typeFlag ? FleetTypeEnum.CAR : FleetTypeEnum.MOTORCYCLE;

    const fleet = new FleetsEntity({
        name: faker.vehicle.vehicle(),
        type,
        plate_number: faker.vehicle.vrm(),
        color: faker.vehicle.color(),
        photos: [
            new FleetPhotosEntity({ photo: faker.image.url() }),
            new FleetPhotosEntity({ photo: faker.image.url() }),
        ],
        price: Number(faker.finance.amount({
            min: 250000,
            max: 500000,
            dec: 0,
        })),

    });

    return new FleetsEntity({
        ...fleet,
        slug: faker.helpers.slugify(`${fleet.name}-${fleet.plate_number}`),
    });
});
