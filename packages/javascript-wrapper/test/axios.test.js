const nock = require('nock')

const yt = require('../lib')({ exportBrowserModule: false })

describe('axios', function () {
    const PROXY = 'kant.yt.my-domain.com'

    beforeEach(function (done) {
        nock.disableNetConnect()

        done()
    })

    it('requests v2.write correctly', async function () {
        const scope = nock('https://kant.yt.my-domain.com')
            .put('/api/v2/write', '{"test":"row 1"}\n{"test":"row 2"}')
            .reply(200, 'wrote')

        const response = await yt.v2.write({
            setup: {
                proxy: PROXY,
                useHeavyProxy: false,
            },
            parameters: { path: '//home/some/path' },
            data: [{ test: 'row 1' }, { test: 'row 2' }],
        })

        expect(response).toEqual('wrote')
        scope.done()
    })

    it('requests v3.insertRows correctly', async function () {
        const scope = nock('https://kant.yt.my-domain.com')
            .put('/api/v3/insert_rows', '{"test":"row 1"}\n{"test":"row 2"}')
            .reply(200, 'inserted rows')

        const response = await yt.v3.insertRows({
            setup: {
                proxy: PROXY,
                useHeavyProxy: false,
            },
            parameters: { path: '//home/some/path' },
            data: [{ test: 'row 1' }, { test: 'row 2' }],
        })

        expect(response).toEqual('inserted rows')
        scope.done()
    })

    it('requests v3.writeTable correctly', async function () {
        const scope = nock('https://kant.yt.my-domain.com')
            .put('/api/v3/write_table', '{"test":"row 1"}\n{"test":"row 2"}')
            .reply(200, 'wrote table')

        const response = await yt.v3.writeTable({
            setup: {
                proxy: PROXY,
                useHeavyProxy: false,
            },
            parameters: { path: '//home/some/path' },
            data: [{ test: 'row 1' }, { test: 'row 2' }],
        })

        expect(response).toEqual('wrote table')
        scope.done()
    })

    afterEach(function (done) {
        nock.cleanAll()
        nock.enableNetConnect()

        done()
    })
})
