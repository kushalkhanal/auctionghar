const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/userModel');
const BiddingRoom = require('../models/biddingRoomModel');
const jwt = require('jsonwebtoken');

// Set up JWT_SECRET for testing
process.env.JWT_SECRET = 'test-jwt-secret-key';

// --- Main Test Suite ---
describe('GET /api/users/my-bids (Bid History)', () => {

    // --- Test Data Setup ---
    let userA, userB, userC, userCToken;
    let room1_active_winning, room2_finished_won, room3_active_outbid, room4_finished_lost, room5_no_bids;

    // This block runs once before all tests in this suite to create a rich test environment
    beforeAll(async () => {
        // Clear database
        await User.deleteMany({});
        await BiddingRoom.deleteMany({});

        // Create Users
        [userA, userB, userC] = await User.create([
            { firstName: 'Alice', lastName: 'A', email: 'alice@test.com', password: 'password', number: '1111111111' },
            { firstName: 'Bob', lastName: 'B', email: 'bob@test.com', password: 'password', number: '2222222222' },
            { firstName: 'Charlie', lastName: 'C', email: 'charlie@test.com', password: 'password', number: '3333333333' },
        ]);
        
        // Create a token for User C, who will be fetching their history
        userCToken = jwt.sign({ userId: userC._id, firstName: userC.firstName, role: userC.role }, process.env.JWT_SECRET);
        
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

        // Create Bidding Rooms with different scenarios
        [
            // SCENARIO 1: An active auction where User C is currently the highest bidder.
            // Should appear in `activeOrOutbid`.
            room1_active_winning,
            
            // SCENARIO 2: A finished auction that User C won.
            // Should appear in `winning`.
            room2_finished_won,
            
            // SCENARIO 3: An active auction where User C was outbid by User B.
            // Should appear in `activeOrOutbid`.
            room3_active_outbid,

            // SCENARIO 4: A finished auction where User C bid, but User B won.
            // Should appear in `activeOrOutbid`.
            room4_finished_lost,
            
            // SCENARIO 5: A room User C has not bid on at all.
            // Should NOT appear in the history.
            room5_no_bids,
        ] = await BiddingRoom.create([
            { seller: userA._id, name: 'Active Watch', description: 'A nice watch', startingPrice: 100, imageUrls: ['/uploads/test1.jpg'], endTime: oneHourFromNow, bids: [{ bidder: userC._id, amount: 110 }] },
            { seller: userA._id, name: 'Won Painting', description: 'A beautiful painting', startingPrice: 200, imageUrls: ['/uploads/test2.jpg'], endTime: oneHourAgo, bids: [{ bidder: userC._id, amount: 250 }] },
            { seller: userA._id, name: 'Outbid Laptop', description: 'A powerful laptop', startingPrice: 500, imageUrls: ['/uploads/test3.jpg'], endTime: oneHourFromNow, bids: [{ bidder: userC._id, amount: 510 }, { bidder: userB._id, amount: 520 }] },
            { seller: userB._id, name: 'Lost Phone', description: 'A smartphone', startingPrice: 300, imageUrls: ['/uploads/test4.jpg'], endTime: oneHourAgo, bids: [{ bidder: userC._id, amount: 310 }, { bidder: userA._id, amount: 330 }] },
            { seller: userB._id, name: 'Untouched Book', description: 'A book', startingPrice: 20, imageUrls: ['/uploads/test5.jpg'], endTime: oneHourFromNow },
        ]);

        // Update current prices based on highest bids
        await BiddingRoom.updateOne({ name: 'Active Watch' }, { $set: { currentPrice: 110 } });
        await BiddingRoom.updateOne({ name: 'Won Painting' }, { $set: { currentPrice: 250 } });
        await BiddingRoom.updateOne({ name: 'Outbid Laptop' }, { $set: { currentPrice: 520 } });
        await BiddingRoom.updateOne({ name: 'Lost Phone' }, { $set: { currentPrice: 330 } });
    });

    afterAll(async () => {
        await User.deleteMany({});
        await BiddingRoom.deleteMany({});
    });

    // --- Test Cases (10+ logical conditions covered) ---

    test('1. [Auth] Should return 401 Unauthorized if no token is provided', async () => {
        const res = await request(app).get('/api/users/my-bids');
        expect(res.status).toBe(401);
    });

    describe('For a user with a complex bid history', () => {
        let res;
        // Run the main API call once before the tests in this block
        beforeAll(async () => {
            res = await request(app)
                .get('/api/users/my-bids')
                .set('Authorization', `Bearer ${userCToken}`);
        });

        test('3. [Status] Should return 200 OK', () => {
            expect(res.status).toBe(200);
        });

        test('4. [Structure] Should return an object with "winning" and "activeOrOutbid" array properties', () => {
            expect(res.body).toHaveProperty('winning');
            expect(res.body).toHaveProperty('activeOrOutbid');
            expect(Array.isArray(res.body.winning)).toBe(true);
            expect(Array.isArray(res.body.activeOrOutbid)).toBe(true);
        });

        test('5. [Winning Bids] The "winning" array should contain only finished, won auctions', () => {
            expect(res.body.winning).toHaveLength(1);
            expect(res.body.winning[0].name).toBe('Won Painting');
        });

        test('6. [Active/Outbid Bids] The "activeOrOutbid" array should contain all other bidded items', () => {
            expect(res.body.activeOrOutbid).toHaveLength(3);
            const roomNames = res.body.activeOrOutbid.map(room => room.name);
            expect(roomNames).toContain('Active Watch');
            expect(roomNames).toContain('Outbid Laptop');
            expect(roomNames).toContain('Lost Phone');
        });

        test('7. [Active & Winning] Should correctly categorize an active auction where the user is winning', () => {
            const activeWinningRoom = res.body.activeOrOutbid.find(room => room.name === 'Active Watch');
            expect(activeWinningRoom).toBeDefined();
            expect(activeWinningRoom.currentPrice).toBe(110);
        });

        test('8. [Active & Outbid] Should correctly categorize an active auction where the user was outbid', () => {
            const outbidRoom = res.body.activeOrOutbid.find(room => room.name === 'Outbid Laptop');
            expect(outbidRoom).toBeDefined();
            expect(outbidRoom.currentPrice).toBe(520);
        });

        test('9. [Finished & Lost] Should correctly categorize a finished auction where the user lost', () => {
            const lostRoom = res.body.activeOrOutbid.find(room => room.name === 'Lost Phone');
            expect(lostRoom).toBeDefined();
            expect(lostRoom.currentPrice).toBe(330);
        });

        test('10. [Data Integrity] Should not include rooms the user has not bid on', () => {
            const untouchedRoom = res.body.activeOrOutbid.find(room => room.name === 'Untouched Book');
            expect(untouchedRoom).toBeUndefined();
        });

        test('11. [Population] Should populate the seller\'s first and last name', () => {
            const roomWithSeller = res.body.winning[0] || res.body.activeOrOutbid[0];
            expect(roomWithSeller.seller).toHaveProperty('firstName');
            expect(roomWithSeller.seller).toHaveProperty('lastName');
        });
    });

    test('2. [Empty State] Should return empty arrays for a user with no bidding history', async () => {
        // Create a new user who has not bid on anything
        const userD = await User.create({
            firstName: 'David',
            lastName: 'D',
            email: 'david@test.com',
            password: 'password',
            number: '4444444444'
        });
        
        const userDToken = jwt.sign({ userId: userD._id, firstName: userD.firstName, role: userD.role }, process.env.JWT_SECRET);
        const res = await request(app)
            .get('/api/users/my-bids')
            .set('Authorization', `Bearer ${userDToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ winning: [], activeOrOutbid: [] });
    });
});