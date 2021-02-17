const request = require('supertest');
const jwt = require('jsonwebtoken');

const User = require('../src/models/userModel');
const app = require('../src/server');
const fake = require('./fixtures/persona');

beforeEach(async () => {
    await User.deleteMany();

    const defaultUser = new User(fake.userOne);
    defaultUser.isActive = true;
    await defaultUser.save();

    const newUser = new User(fake.userTwo);
    await newUser.save();
});


// Register
describe('Authentification', () => {
    
    // Création de compte
    describe('Register', () => {
        test('CT01-P: Registration', async () => {
            const response = await request(app)
                .post('/api/v1/users/register')
                .send(fake.persona4)
                .expect(201);
        
            const user = await User.findById(response.body.user._id);
            expect(user).not.toBeNull();
        
            expect(response.body).toMatchObject({
                user: {
                    username: 'jacPai',
                    firstname: 'Jacques',
                    lastname: 'Paiement',
                    email: 'jacpai@arkcan.com'
                },
                token: jwt.sign({ _id: response.body.user._id }, process.env.JWT_TOKEN_RESET)
            })
        
            expect(user.password).not.toBe('password');
        });
        
        test('CT02-E: Missing parameter', async () => {
            await request(app).post('/api/v1/users/register').send({
                username: "robou",
                firstname: "Robin",
                lastname: "Bouchard",
                birthdate: "1998-04-12",
                password: "password",
                confirmation: "password"
            })
            .expect(400);
        });
        
        test('CT03-E: One more parameter than expected', async () => {
            await request(app)
                .post('/api/v1/users/register')
                .send({
                    username: "robou",
                    firstname: "Robin",
                    lastname: "Bouchard",
                    birthdate: "1998-04-12",
                    isActive: true,
                    password: "password",
                    confirmation: "password"
                })
                .expect(400);
        });
        
        test('CT04-E: User already exist', async () => {
            await request(app)
                .post('/api/v1/users/register')
                .send(fake.persona1)
                .expect(500);
        });
    });

    describe('Login', () => {
        test('CT01-P: Username authentification', async () => {
            await request(app)
                .post('/api/v1/users/login')
                .send(fake.persona1_login_username)
                .expect(200);
        });
        
        test('CT02-P: Email authentification', async () => {
            await request(app)
                .post('/api/v1/users/login')
                .send(fake.persona1_login_email)
                .expect(200);
        });
        
        test('CT03-E: Inactive account', async () => {
            const response = await request(app)
                .post('/api/v1/users/login')
                .send(fake.userTwo)
                .expect(400);
        });

        test('CT04-E: Wrong credentials', async () => {
            const response = await request(app)
                .post('/api/v1/users/login')
                .send({
                    "login": "eloMich",
                    "password": "password1"
                })
                .expect(400);
        });
    });

    describe('Logout', () => {
        test('CT01-P: Logout active session', async () => {
            const response = await request(app)
                .post('/api/v1/users/logout')
                .set('Authorization', `Bearer ${fake.userOne.tokens[0].token}`)
                .expect(200);

                const user = await User.findById(fake.userOne._id);
                expect(user.tokens[1]).toBeUndefined();
        });

        test('CT02-P: Logout all session', async () => {
            const response = await request(app)
                .post('/api/v1/users/logoutAll')
                .set('Authorization', `Bearer ${fake.userOne.tokens[0].token}`)
                .expect(200);

                const user = await User.findById(fake.userOne._id);
                expect(user.tokens[0]).toBeUndefined();
        });

        test('CT03-E: Logout active session', async () => {
            const response = await request(app)
                .post('/api/v1/users/logout')
                .expect(500);

            expect(response.body.message).toBe('Authentifiction failed!');
        });

        test('CT04-E: Logout active session', async () => {
            const response = await request(app)
                .post('/api/v1/users/logoutAll')
                .expect(500);

            expect(response.body.message).toBe('Authentifiction failed!');
        });
    });

    describe('Account confirmation', () => {
        test('CT01-P: Confirm user email', async () => {
            await request(app)
                .get('/api/v1/users/emailConfirmation/' + fake.userTwoToken)
                .send()
                .expect(200)
        });
        
        test('CT02-E: Accound already activated', async () => {
            await request(app)
                .get('/api/v1/users/emailConfirmation/' + fake.userOneToken)
                .send()
                .expect(400)
        });
    });
    
});



// Profile
describe('Profile feature', () => {
    test('Cas passant: Accéder au profil de l\'utilisateur', async () => {
        await request(app)
            .get('/api/v1/users')
            .set('Authorization', `Bearer ${fake.userOne.tokens[0].token}`)
            .send()
            .expect(200);
    });
    
    test('Cas passant: Suppression du profil utilisateur', async () => {
        const response = await request(app)
            .delete('/api/v1/users')
            .set('Authorization', `Bearer ${fake.userOne.tokens[0].token}`)
            .send()
            .expect(200);
    
        const user = await User.findById(response.body._id);
    
        expect(user).toBeNull();
    });
    
    test('Cas d\'éched: Non suppression du profil utilisateur par utilisateur non authentifié', async () => {
        await request(app)
            .delete('/api/v1/users')
            .send()
            .expect(500);
    
        const user_one = await User.findById(fake.userOne._id);
        const user_two = await User.findById(fake.userTwo._id);
    
        expect(user_one).not.toBeNull();
        expect(user_two).not.toBeNull();
    });
})



// Avatar
describe('Avatar feature', () => {
    test('Test image', async () => {
        await request(app)
            .post('/api/v1/users/avatar')
            .set('Authorization', `Bearer ${fake.userOne.tokens[0].token}`)
            .attach('avatar','tests/fixtures/persona1.jpeg')
            .expect(201);
    
        const user = await User.findById(fake.userOne._id);
        expect(user.avatar).toEqual(expect.any(Buffer));
    });
    
    test('Image too big', async () => {
        const response = await request(app)
            .post('/api/v1/users/avatar')
            .set('Authorization', `Bearer ${fake.userOne.tokens[0].token}`)
            .attach('avatar','tests/fixtures/avatarTooBig.png')
            .expect(500);
    
        expect(response.body.message).toBe('File too large')
    });
    
    test('Not an image', async () => {
        const response = await request(app)
            .post('/api/v1/users/avatar')
            .set('Authorization', `Bearer ${fake.userOne.tokens[0].token}`)
            .attach('avatar','tests/fixtures/notImage.pdf')
            .expect(500);
    
        expect(response.body.message).toBe('Send an image')
    });
    
    test('Delete an avatar', async () => {
        await request(app)
            .post('/api/v1/users/avatar')
            .set('Authorization', `Bearer ${fake.userOne.tokens[0].token}`)
            .attach('avatar','tests/fixtures/persona1.jpeg')
            .expect(201);
    
        await request(app)
            .delete('/api/v1/users/avatar')
            .set('Authorization', `Bearer ${fake.userOne.tokens[0].token}`)
            .expect(200);
    
            const user = await User.findById(fake.userOne._id);
            expect(user.avatar).toBeUndefined();
    });
})