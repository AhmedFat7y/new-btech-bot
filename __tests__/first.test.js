// import Api from '../src/Api';

// const app = new Api().express;

describe('Flow API', () => {
  it('hello test', () => {
    return request(app).get('/')
    .expect(200)
    .then((res) => {
      console.log(res.text);
      expect(typeof res.text).toBe('string');
      expect(res.text).toBe('Hello world!');
    });
  });
});
