'use strict';
var Promise = require('bluebird');

var expect = require('chai').expect;
var chai = require('chai')
    .use(require('chai-http'));
var server = require('../server/server');
var cpx = require('cpx');

var gql = require('graphql-tag');
// var _ = require('lodash');

describe('query', () => {

    before(() => {
        return Promise.fromCallback((cb) => {
            return cpx.copy('./data.json', './data/', cb);
        });
    });

    describe('Single entity', () => {
        it('should execute a plural query', () => {
            const query = gql `
            {
                allNotes(first: 2) {
                    totalCount
                    Notes {
                        title
                        id
                    }
                }
            }`;
            return chai.request(server)
                .post('/graphql')
                .send({
                    query
                })
                .then(res => {
                    expect(res).to.have.status(200);
                    let result = res.body.data;
                    console.log('RESULT', result);
                    expect(result.allNotes.totalCount).to.be.above(1);
                    expect(result.allNotes.Notes.length).to.equal(2);
                });
        });

        it('should execute a single query', () => {
            const query = gql `
                query {
                    Note (id: 1) {
                        title
                        id
                        content
                        
                    }
                }
                `;
            return chai.request(server)
                .post('/graphql')
                .send({
                    query
                })
                .then(res => {
                    expect(res).to.have.status(200);
                    expect(res.body.data.Note.id).to.equal(1);
                });
        });
    });

    describe('relationships', () => {
        it('should query related entity', () => {
            const query = gql `
                query {
                    Author(id: 5) {
                        first_name
                        id
                        notes {
                        totalCount
                        Notes {
                            title
                        }
                        }
                    }
                    }
            `;
            return chai.request(server)
                .post('/graphql')
                .send({
                    query
                })
                .then(res => {
                    expect(res).to.have.status(200);
                    expect(res.body.data.Author.notes.Notes.length).to.be.above(0);
                });
        });
    });

});