import { setSeederFactory } from "typeorm-extension";
import { UserEntity } from "../src/modules/users/entities/user.entity";
import { UserGenderEnum } from "../src/modules/users/enums/user.gender.enum";
import { UserRoleEnum } from "../src/modules/users/enums/user.role.enum";
import { PasswordHashHelper } from "../src/config/helper/hash/password-hash.helper";
import { UserIdCards } from "src/modules/users/entities/user-id-cards.entity";
import { UserStatusEnum } from "src/modules/users/enums/user.status.enum";

export default setSeederFactory(UserEntity, async (faker) => {
    const genderFlag = faker.number.int(1);
    const gender = genderFlag ? UserGenderEnum.MALE : UserGenderEnum.FEMALE;

    const roleFlag = faker.number.int(1);
    const role = roleFlag ? UserRoleEnum.DRIVER : UserRoleEnum.CUSTOMER;

    return new UserEntity({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: await PasswordHashHelper.hash('secret'),
        photo_profile: faker.image.url(),
        gender,
        role,
        phone_number: faker.phone.number('628##########'),
        emergency_phone_number: faker.phone.number('628##########'),
        date_of_birth: faker.date.past(),
        nik: faker.string.alphanumeric(16),
        id_cards: [
            new UserIdCards({ photo: faker.image.url() }),
            new UserIdCards({ photo: faker.image.url() }),
        ],
        status: UserStatusEnum.VERIFIED,
    });
});
