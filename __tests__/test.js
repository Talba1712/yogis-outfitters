const request = require('supertest')
const app = require('../server.js')
const adminUser = request.agent(app)

let newItem = {
    productType: "Tops",
    productName: "Test",
    productDescription: "Test",
    productPrice: "Test",
    productMainImage: "Test.jpg",
    productSubImage1: "Test.jpg",
    productSubImage2: "Test.jpg",
    productSubImage3: "Test.jpg"
}

let newPurchase = {
    "products": [],
    "fullName": "Test",
    "address": "Test",
    "country": "Test",
    "shipMethod": "Test"
}

let adminDetails = {
    username: "admin",
    email: "admin@admin.com",
    password: "Aa123456"
}

describe("Run general tests that doesn't require you to be logged in", () => {
    it("Add contact details", async () => {
        const response = await adminUser
            .post('/contact')
            .send({
                fname: "Test",
                contactEmail: "Test@test.com",
                contactMessage: "Test message"
            })
        expect(response.status).toBe(200)
    })
    it("Add subscriber", async() => {
        const response = await adminUser
            .post('/subscribe')
            .send({
                email: "Test@test.com"
            })
        expect(response.status).toBe(200)
    })
    it ('Search for an item', async () => {
        const response = await adminUser
            .post('/searchPage')
            .send({
                searchInput: "Amy"
            })
        expect(response.status).toBe(200)
    })
    it('Add an item to bag while no being logged in', async() => {
        const response = await adminUser
            .put(`/sproduct/addToBag/Test/s/2`)
        expect(response.text).toBe("false")
    })
    it ('Create a bag while not being admin', async() => {
        const response = await adminUser
            .get('/myBagPage/createBag')
        expect(response.text).toBe("false")
    })
    it('Increase amount of product in my bag while not being logged in', async() => {
        const response = await adminUser
            .post('/myBagPage/increaseProductAmount')
            .send({
                itemIndexInBag: "0"})
        expect(response.text).toBe("false")
    })
    it('Decrease amount of product in my bag while not being logged in', async() => {
        const response = await adminUser
            .post('/myBagPage/decreaseProductAmount')
            .send({
                itemIndexInBag: "0"})
        expect(response.text).toBe("false")
    })
    it('Remove item from bag while not being logged in', async() => {
        const response = await adminUser
            .delete('/myBagPage/removeItemFromBag/0')
        expect(response.text).toBe("false")
    })
    it ('Create checkout page while not being logged in', async () => {
        const response = await adminUser
            .get('/checkoutPage/createPage')
        expect(response.text).toBe("false")
    })
    it('Place an order while not being logged in', async () => {
        const response = await adminUser
            .post('/checkoutPage/placeOrder')
            .send({
                newPurchase: newPurchase
            })
        expect(response.text).toBe("false")
    })
    it('Login with wrong email', async() => {
        const response = await adminUser
            .post('/login')
            .send({
                email: "test@test.com",
                password: "Aa123456"
            })
        expect(response.text).toBe("false")
    })
    it('Login with wrong password', async() => {
        const response = await adminUser
            .post('/login')
            .send({
                email: "admin@admin.com",
                password: "Aa12345678"
            })
        expect(response.text).toBe("false")
    })
    it('Logout without being logged in', async() => {
        const response = await adminUser
            .get('/logout')
        expect(response.status).toBe(200)
    })
})

describe('POST to /login/ and make tests that require you to be logged in', () => {
    it('Login with admin credentials', async () => {
        const res = await adminUser
            .post('/login')
            .send({
                email: "admin@admin.com",
                password: "Aa123456",
                rememberMe: "false"
            })
        expect(res.text).toBe("true")
    })
    it ('Search for an existing user in admin page', async () => {
        const response =  await adminUser
            .post('/admin/userSearch')
            .send({
                searchText: "admin"
            })
        const searchResult = response.text !== "[]"

        expect(searchResult).toBe(true)
    })
    it ('Search for a non existing user in admin page', async () => {
        const response =  await adminUser
            .post('/admin/userSearch')
            .send({
                searchText: "test"
            })
        const searchResult = response.text !== "[]"

        expect(searchResult).toBe(false)
    })
    it ('Go to search a user page while being admin', async () => {
        const response =  adminUser
            .get('/adminPages/filterUsersPage.html')
        const responseUrl = response.url

        expect(responseUrl.substring(22)).toBe(`/adminPages/filterUsersPage.html`)
    })
    it('Add a new item to store', async() => {
        const response = await adminUser
            .put(`/admin/addNewItem/${JSON.stringify(newItem)}`)
        expect(response.status).toBe(200)
    })
    it('Check if an item exists (send an existing item name)', async() => {
        const response = await adminUser
            .post('/admin/productNameSearch')
            .send({
                productName: "Test"
            })
        expect(response.text).toBe("true")
    })
    it('Check if an item exists (send a non existing item name)', async() => {
        const response = await adminUser
            .post('/admin/productNameSearch')
            .send({
                productName: "Test-Not-Exist"
            })
        expect(response.text).toBe("false")
    })
    it ('Go to admin menu page while being admin', async() => {
        const response = adminUser
            .get('/adminPages/menuPage.html');
        const responseUrl = response.url

        expect(responseUrl.substring(22)).toBe(`/adminPages/menuPage.html`)
    })
    it ('Remove a non existing product from store', async() => {
        const response = await adminUser
            .delete('/admin/removeItem/Test')
        expect(response.text).toBe("true")
    })
    it ('Go to add a new item page while being admin', async () => {
        const response =  adminUser
            .get('/adminPages/addNewItem.html')
        const responseUrl = response.url

        expect(responseUrl.substring(22)).toBe(`/adminPages/addNewItem.html`)
    })
    it('Add an item to bag', async() => {
        const response = await adminUser
            .put(`/sproduct/addToBag/Test/s/2`)
        expect(response.text).toBe("true")
    })
    it('Remove item from bag', async() => {
        const response = await adminUser
            .delete('/myBagPage/removeItemFromBag/0')
        expect(response.text).toBe("true")
    })
    it ('Create checkout page', async () => {
        const response = await adminUser
            .get('/checkoutPage/createPage')
        expect(response.status).toBe(200)
    })
    it('Place an order while being logged in', async () => {
        const response = await adminUser
            .post('/checkoutPage/placeOrder')
            .send({
                newPurchase: newPurchase
            })
        expect(response.text).toBe("true")
    })
    it ('Remove an existing product from store', async() => {
        const response = await adminUser
            .delete('/admin/removeItem/Test')
        expect(response.status).toBe(200)
    })
    it('Logout', async() => {
        const response = await adminUser
            .get('/logout')
        expect(response.status).toBe(200)
    })
})
