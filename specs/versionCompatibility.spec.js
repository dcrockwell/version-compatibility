var should = require('should'),
    sinon = require('sinon'),
    rewire = require("rewire"),
    VersionCompatibility = rewire('../lib/versionCompatibility');

describe('VersionCompatibility(compatibilityMatrix)', function() {

    var compatibilityMatrix,
        versions;

    beforeEach(function(){
        compatibilityMatrix = {
            "v1.0.1":"1.5.2-R0.1",
            "v1.0.2-beta":">1.5.2-R0.2 <1.6.5",
            "v1.0.3":">=1.6.0-0 <1.7.0-0",
            "v1.0.4":"1.7.x"
        };
        versions = new VersionCompatibility(compatibilityMatrix);
    });

    describe('parameters',function(){
        describe('compatibilityMatrix',function(){
            it('should be sanitized, resolved, and exposed via a this.compatibilityMatrix',function(){
                var expectedMatrix = {
                    '1.0.1': '1.5.2-R0.1',
                    '1.0.2-beta': '>1.5.2-R0.2 <1.6.5-0',
                    '1.0.3': '>=1.6.0-0 <1.7.0-0',
                    '1.0.4': '>=1.7.0-0 <1.8.0-0'
                };
                versions.compatibilityMatrix.should.eql(expectedMatrix);
            });
            it('should throw an error if not provided',function(){
                (function(){
                    new VersionCompatibility();
                }).should.throw('compatibilityMatrix is a required parameter');
            });
            it('should throw an error if not a string',function(){
                (function(){
                    new VersionCompatibility(1);
                }).should.throw('compatibilityMatrix must be an object with keys of versions numbers, and values of version ranges');
                (function(){
                    new VersionCompatibility(function(){});
                }).should.throw('compatibilityMatrix must be an object with keys of versions numbers, and values of version ranges');
                (function(){
                    new VersionCompatibility([]);
                }).should.throw('compatibilityMatrix must be an object with keys of versions numbers, and values of version ranges');
            });
            it('should throw an error if any of the primary versions are invalid',function(){
                (function(){
                    compatibilityMatrix['5.02'] = "1.5.2-R0.1";
                    new VersionCompatibility(compatibilityMatrix);
                }).should.throw("'5.02' is not a valid semantic version number");
            });
            it('should throw an error if any of the compatibility ranges are invalid',function(){
                (function(){
                    compatibilityMatrix['1.5.2'] = ">5.02";
                    new VersionCompatibility(compatibilityMatrix);
                }).should.throw("'>5.02' is not a valid semantic version range");
            });
        });
    });

    describe('functions',function(){
        describe('setCompatibilityMatrix(newCompatibilityMatrix)',function(){

            it('should replace the current compatibility matrix',function(){
                compatibilityMatrix = {
                    "v1.0.5":"1.5.2-R0.1",
                    "v1.0.6-beta":">1.5.2-R0.2 <1.6.x",
                    "v1.0.7":">=1.6.0-0 <1.7.0-0",
                    "v1.0.8":">1.6.2"
                };

                versions.setCompatibilityMatrix(compatibilityMatrix);
                versions.compatibilityMatrix.should.eql({
                    "1.0.5":"1.5.2-R0.1",
                    "1.0.6-beta":">1.5.2-R0.2 <1.6.0-0",
                    "1.0.7":">=1.6.0-0 <1.7.0-0",
                    "1.0.8":">1.6.2"
                });
            });

            it('should throw an error if not provided',function(){
                (function(){
                    versions.setCompatibilityMatrix(null);
                }).should.throw('compatibilityMatrix is a required parameter');
            });

        });
        describe('compatibleWith(version)',function(){
            it('should correctly return an array of all versions compatible with 1.5.3',function(){
                versions.compatibleWith('1.5.3').should.eql([
                    '1.0.2-beta'
                ]);
            });
            it('should correctly return an array of all versions compatible with 1.5.1',function(){
                versions.compatibleWith('1.5.1').should.eql([]);
            });
            it('should correctly return an array of all versions compatible with 1.6.4',function(){
                versions.compatibleWith('1.6.4').should.eql([
                    '1.0.3', '1.0.2-beta'
                ]);
            });
            it('should correctly return an array of all versions compatible with 1.6.5',function(){
                versions.compatibleWith('1.6.5').should.eql([
                    '1.0.3'
                ]);
            });
            it('should correctly return an array of all versions compatible with 1.8.0',function(){
                versions.compatibleWith('1.8.0').should.eql([]);
            });
        });
        describe('recommendedFor(version)',function(){
            it('should correctly return the highest version compatible with 1.5.3',function(){
                versions.recommendedFor('1.5.3').should.eql('1.0.2-beta');
            });
            it('should correctly return the highest version compatible with 1.6.4',function(){
                versions.recommendedFor('1.6.4').should.eql('1.0.3');
            });
            it('should correctly return the highest version compatible with 1.6.5',function(){
                versions.recommendedFor('1.6.5').should.eql('1.0.3');
            });
            it('should correctly return null for the highest version compatible with 1.5.1',function(){
                should.not.exist(versions.recommendedFor('1.5.1'));
            });
            it('should correctly return null for the highest version compatible with 1.8.0',function(){
                should.not.exist(versions.recommendedFor('1.8.0'));
            });
        });
        describe('all()',function(){
            it('should return all primary version strings in an array',function(){
                versions.all().should.eql([
                    '1.0.1', '1.0.2-beta', '1.0.3', '1.0.4'
                ]);
            });
        });
    });

});
