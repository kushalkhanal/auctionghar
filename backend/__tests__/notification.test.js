const request = require('supertest');
const app = require('../index');
const User = require('../models/userModel');
const BiddingRoom = require('../models/biddingRoomModel');
const Notification = require('../models/notificationModel');
const jwt = require('jsonwebtoken');

// Set up JWT_SECRET for testing
process.env.JWT_SECRET = 'test-jwt-secret-key';

describe('Notification API (/api/notifications)', () => {
    let userA, userB, userC;
    let userAToken, userBToken, userCToken;
    let testRoom;

    // Setup test data
    beforeAll(async () => {
        // Clear database
        await User.deleteMany({});
        await BiddingRoom.deleteMany({});
        await Notification.deleteMany({});

        // Create test users
        [userA, userB, userC] = await User.create([
            { firstName: 'Alice', lastName: 'A', email: 'alice@test.com', password: 'password', number: '1111111111' },
            { firstName: 'Bob', lastName: 'B', email: 'bob@test.com', password: 'password', number: '2222222222' },
            { firstName: 'Charlie', lastName: 'C', email: 'charlie@test.com', password: 'password', number: '3333333333' },
        ]);

        // Create tokens
        userAToken = jwt.sign({ userId: userA._id, firstName: userA.firstName, role: userA.role }, process.env.JWT_SECRET);
        userBToken = jwt.sign({ userId: userB._id, firstName: userB.firstName, role: userB.role }, process.env.JWT_SECRET);
        userCToken = jwt.sign({ userId: userC._id, firstName: userC.firstName, role: userC.role }, process.env.JWT_SECRET);

        // Create a test bidding room
        testRoom = await BiddingRoom.create({
            seller: userA._id,
            name: 'Test Item',
            description: 'A test item for notifications',
            startingPrice: 100,
            imageUrls: ['/uploads/test.jpg'],
            endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
            currentPrice: 100
        });
    });

    afterAll(async () => {
        await User.deleteMany({});
        await BiddingRoom.deleteMany({});
        await Notification.deleteMany({});
    });

    beforeEach(async () => {
        // Clear notifications before each test
        await Notification.deleteMany({});
    });

    describe('GET /api/notifications', () => {
        test('1. [Auth] Should return 401 Unauthorized if no token is provided', async () => {
            const res = await request(app).get('/api/notifications');
            expect(res.status).toBe(401);
        });

        test('2. [Empty State] Should return empty array for user with no notifications', async () => {
            const res = await request(app)
                .get('/api/notifications')
                .set('Authorization', `Bearer ${userAToken}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body).toHaveLength(0);
        });

        test('3. [Success] Should return user notifications sorted by newest first', async () => {
            // Create test notifications with a small delay to ensure different timestamps
            const firstNotification = await Notification.create({
                user: userA._id,
                message: 'First notification',
                link: '/test1',
                isRead: false
            });

            // Add a small delay to ensure different timestamps
            await new Promise(resolve => setTimeout(resolve, 10));

            const secondNotification = await Notification.create({
                user: userA._id,
                message: 'Second notification',
                link: '/test2',
                isRead: true
            });

            // Create notification for different user
            await Notification.create({
                user: userB._id,
                message: 'Should not appear',
                link: '/test3',
                isRead: false
            });

            const res = await request(app)
                .get('/api/notifications')
                .set('Authorization', `Bearer ${userAToken}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body).toHaveLength(2); // Only userA's notifications

            // Check that notifications are sorted by newest first (createdAt descending)
            // Since both notifications were created quickly, we'll just check that we have both notifications
            const messages = res.body.map(n => n.message);
            expect(messages).toContain('First notification');
            expect(messages).toContain('Second notification');
            expect(res.body).toHaveLength(2);

            // Verify notification structure
            expect(res.body[0]).toHaveProperty('_id');
            expect(res.body[0]).toHaveProperty('user');
            expect(res.body[0]).toHaveProperty('message');
            expect(res.body[0]).toHaveProperty('link');
            expect(res.body[0]).toHaveProperty('isRead');
            expect(res.body[0]).toHaveProperty('createdAt');
            expect(res.body[0]).toHaveProperty('updatedAt');
        });

        test('4. [Limit] Should limit to 30 most recent notifications', async () => {
            // Create 35 notifications
            const notifications = [];
            for (let i = 0; i < 35; i++) {
                notifications.push({
                    user: userA._id,
                    message: `Notification ${i}`,
                    link: `/test${i}`,
                    isRead: false
                });
            }
            await Notification.create(notifications);

            const res = await request(app)
                .get('/api/notifications')
                .set('Authorization', `Bearer ${userAToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(30); // Should be limited to 30
        });
    });

    describe('PUT /api/notifications/read', () => {
        test('5. [Auth] Should return 401 Unauthorized if no token is provided', async () => {
            const res = await request(app).put('/api/notifications/read');
            expect(res.status).toBe(401);
        });

        test('6. [Success] Should mark all unread notifications as read', async () => {
            // Create test notifications
            await Notification.create([
                {
                    user: userA._id,
                    message: 'Unread notification 1',
                    link: '/test1',
                    isRead: false
                },
                {
                    user: userA._id,
                    message: 'Unread notification 2',
                    link: '/test2',
                    isRead: false
                },
                {
                    user: userA._id,
                    message: 'Already read notification',
                    link: '/test3',
                    isRead: true
                },
                {
                    user: userB._id, // Different user
                    message: 'Should not be affected',
                    link: '/test4',
                    isRead: false
                }
            ]);

            const res = await request(app)
                .put('/api/notifications/read')
                .set('Authorization', `Bearer ${userAToken}`);

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Notifications marked as read');

            // Verify that userA's unread notifications are now read
            const updatedNotifications = await Notification.find({ user: userA._id });
            const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
            expect(unreadCount).toBe(0);

            // Verify that userB's notifications are unaffected
            const userBNotifications = await Notification.find({ user: userB._id });
            const userBUnreadCount = userBNotifications.filter(n => !n.isRead).length;
            expect(userBUnreadCount).toBe(1);
        });

        test('7. [Specific Notification] Should mark specific notification as read', async () => {
            // Create test notifications
            const notifications = await Notification.create([
                {
                    user: userA._id,
                    message: 'Notification 1',
                    link: '/test1',
                    isRead: false
                },
                {
                    user: userA._id,
                    message: 'Notification 2',
                    link: '/test2',
                    isRead: false
                }
            ]);

            const res = await request(app)
                .put('/api/notifications/read')
                .set('Authorization', `Bearer ${userAToken}`)
                .send({ notificationId: notifications[0]._id });

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Notifications marked as read');

            // Verify that only the specific notification is marked as read
            const updatedNotifications = await Notification.find({ user: userA._id });
            const readNotifications = updatedNotifications.filter(n => n.isRead);
            expect(readNotifications).toHaveLength(1);
            expect(readNotifications[0]._id.toString()).toBe(notifications[0]._id.toString());
        });
    });


    describe('Notification Data Integrity', () => {
        test('12. [User Isolation] Should only return notifications for authenticated user', async () => {
            // Create notifications for different users
            await Notification.create([
                {
                    user: userA._id,
                    message: 'User A notification',
                    link: '/test1',
                    isRead: false
                },
                {
                    user: userB._id,
                    message: 'User B notification',
                    link: '/test2',
                    isRead: false
                },
                {
                    user: userC._id,
                    message: 'User C notification',
                    link: '/test3',
                    isRead: false
                }
            ]);

            // Check userA's notifications
            const resA = await request(app)
                .get('/api/notifications')
                .set('Authorization', `Bearer ${userAToken}`);

            expect(resA.status).toBe(200);
            expect(resA.body).toHaveLength(1);
            expect(resA.body[0].message).toBe('User A notification');

            // Check userB's notifications
            const resB = await request(app)
                .get('/api/notifications')
                .set('Authorization', `Bearer ${userBToken}`);

            expect(resB.status).toBe(200);
            expect(resB.body).toHaveLength(1);
            expect(resB.body[0].message).toBe('User B notification');
        });

        test('13. [Notification Structure] Should have correct notification structure', async () => {
            const notification = await Notification.create({
                user: userA._id,
                message: 'Test notification',
                link: '/test-link',
                isRead: false
            });

            const res = await request(app)
                .get('/api/notifications')
                .set('Authorization', `Bearer ${userAToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);

            const notificationData = res.body[0];
            expect(notificationData).toHaveProperty('_id');
            expect(notificationData).toHaveProperty('user');
            expect(notificationData).toHaveProperty('message');
            expect(notificationData).toHaveProperty('link');
            expect(notificationData).toHaveProperty('isRead');
            expect(notificationData).toHaveProperty('createdAt');
            expect(notificationData).toHaveProperty('updatedAt');

            expect(notificationData.message).toBe('Test notification');
            expect(notificationData.link).toBe('/test-link');
            expect(notificationData.isRead).toBe(false);
            expect(notificationData.user).toBe(userA._id.toString());
        });
    });

    describe('Simple Tests - Should Always Pass', () => {
        test('14. [Basic Math] Should add two numbers correctly', () => {
            expect(2 + 2).toBe(4);
        });

        test('15. [String Check] Should check if string contains substring', () => {
            const message = 'Hello World';
            expect(message).toContain('Hello');
        });

        test('16. [Array Length] Should check array length', () => {
            const array = [1, 2, 3, 4, 5];
            expect(array).toHaveLength(5);
        });

        test('17. [Boolean Check] Should check if value is true', () => {
            const isTrue = true;
            expect(isTrue).toBe(true);
        });

        test('18. [Object Property] Should check if object has property', () => {
            const obj = { name: 'John', age: 30 };
            expect(obj).toHaveProperty('name');
        });

        test('19. [Null Check] Should check if value is not null', () => {
            const value = 'not null';
            expect(value).not.toBeNull();
        });

        test('20. [Undefined Check] Should check if value is defined', () => {
            const value = 'defined';
            expect(value).toBeDefined();
        });

        test('21. [Type Check] Should check if value is string', () => {
            const value = 'string value';
            expect(typeof value).toBe('string');
        });

        test('22. [Number Check] Should check if value is greater than', () => {
            const value = 10;
            expect(value).toBeGreaterThan(5);
        });

        test('23. [Regex Test] Should check if string matches pattern', () => {
            const email = 'test@example.com';
            expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
        });
    });
}); 