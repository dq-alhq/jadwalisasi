import db from '#/db'
import { auth } from '#/lib/auth'

async function main() {
    console.info('🌱 Seeding starting...')

    await db.group.createMany({
        data: [
            { name: 'A', id: 'a' },
            { name: 'B', id: 'b' },
            { name: 'C', id: 'c' },
            { name: 'D', id: 'd' }
        ]
    })

    await auth.api.createUser({
        body: {
            email: 'admin@gmail.com',
            name: 'Administrator',
            password: 'password',
            role: 'admin',
            data: { username: 'admin', displayUsername: 'Administrator' }
        }
    })

    const employees = [
        { nick: 'Fety', nama: 'Fetty Rohmawati, S.E', group: 'd' },
        { nick: 'Akmal', nama: 'Januar Akmal Farezi, S.H.', group: 'b' },
        { nick: 'Nisa', nama: "Khoirotun Nisa', S.Sos", group: 'c' },
        { nick: 'Nia', nama: "Qurrotul 'Ainia, S.Akun", group: 'd' },
        { nick: 'Aida', nama: 'Aida Mursyidah, S.Si', group: 'b' },
        { nick: 'Tias', nama: 'Oktavianti Astuti', group: 'c' },
        { nick: 'Vita', nama: 'Fadma Vita Puspita Sari, SE', group: 'a' },
        { nick: 'Asa', nama: 'Brilian Aura Muhasabah, S.Pd.', group: 'a' }
    ]

    employees.forEach(async (employee) => {
        await auth.api.createUser({
            body: {
                email: `${employee.nick.toLowerCase()}@gmail.com`, // required
                password: 'password', // required
                name: employee.nama, // required
                role: 'user',
                data: { groupId: employee.group, username: employee.nick.toLowerCase(), displayUsername: employee.nick }
            }
        })
    })

    console.info('🌱 Seeding completed...')
}

main()
