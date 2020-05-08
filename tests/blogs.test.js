const mongoose = require('mongoose')
const Page = require('./helpers/page');

let page;

beforeEach(async () => {
  page = await Page.build()
  await page.goto('http://localhost:3000');
});

afterEach(async () => {
  await page.close();
});

afterAll(async done => {
  // Closing the DB connection allows Jest to exit successfully.
  await mongoose.connection.close()
  done();
});

// GROUP TEST
describe('When logged in', () => {
  beforeEach(async () => {
    await page.login();
    await page.click('a.btn-floating');
  });

  test('can see blog create form', async () => {
    const label = await page.getContentsOf('form label');
    expect(label).toEqual('Blog Title');
  });

  describe('And using invalid inputs', () => {
    beforeEach(async () => {
      await page.click('form button');
    })
    test('The form shows an error message', async () => {
      const titleError = await page.getContentsOf('.title .red-text')
      const contentError = await page.getContentsOf('.content .red-text')

      expect(titleError).toEqual('You must provide a value');
      expect(contentError).toEqual('You must provide a value');
    })
  });

  describe('And using valid inputs', () => {
    beforeEach(async () => {
      await page.type('.title input', 'My Title 1');
      await page.type('.content input', 'My Content 1');
      await page.click('form button');
    });

    test('Submitting takes user to review screen', async () => {
      const text = await page.getContentsOf('h5');
      expect(text).toEqual('Please confirm your entries');
    });

    test('Submmiting and saving adds blog to index page', async () => {
      await page.click('button.green');
      await page.waitFor('.card');
      const title = await page.getContentsOf('.card-title');
      const content = await page.getContentsOf('p');

      expect(title).toEqual('My Title 1');
      expect(content).toEqual('My Content 1');
    });
  })
});

describe('When not logged in', () => {
  const actions = [
    {
      method: 'get',
      path: 'api/blogs'
    }, {
      method: 'post',
      path: 'api/blogs',
      data: { title: 'Title 1', content: 'Content 1' }
    }
  ]

  test('Blog related actions are prohibited', async () => {
    const results = await page.execRequests(actions)
    results.forEach(result => {
      expect(result).toEqual({ error: 'You must log in!' });
    })
  })

  // test('user cannot create blog post', async () => {
  //   const result = await page.post('/api/blogs', { title: 'My Title', content: 'My Content' })
  //   // console.log(result);
  //   expect(result).toEqual({ error: 'You must log in!' });
  // });

  // test('user cannot get list of blog post', async () => {
  //   const result = await page.get('api/blogs')
  //   // console.log(result);
  //   expect(result).toEqual({ error: 'You must log in!' });
  // });

})