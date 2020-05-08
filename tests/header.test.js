// const puppeteer = require('puppeteer');
const mongoose = require('mongoose')
const Page = require('./helpers/page');

// test('add two numbers', () => {
//   const sum = 1 + 2;
//   expect(sum).toEqual(3);
// })
let page;

beforeEach(async () => {

  page = await Page.build()
  await page.goto('http://localhost:3000');
});

afterEach(async () => {
  // await browser.close();
  await page.close();
});

afterAll(async done => {
  // Closing the DB connection allows Jest to exit successfully. 
  await mongoose.connection.close()
  done();
});

test('header has "Blogster" text', async () => {
  // const text = await page.$eval('a.brand-logo', el => el.innerHTML);
  const text = await page.getContentsOf('a.brand-logo');
  expect(text).toEqual('Blogster')
});

test('clicking login starts oAuth flow', async () => {
  await page.click('.right a');
  const url = await page.url();

  expect(url).toMatch(/accounts\.google\.com/);
})

test('When signed in, shows logout button', async () => {
  await page.login();
  const text = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML)
  expect(text).toEqual('Logout')
})

