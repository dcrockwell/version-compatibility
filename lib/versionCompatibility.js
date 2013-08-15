/* Dependencies */
var semver = require('semver');
var _ = require('underscore');

/**
 * Takes a matrix of primary semantic version numbers that are correlated with secondary semantic
 * version ranges and allows you to quickly determine compatibility between two sets of version numbers.
 *
 * @class VersionCompatibility
 *
 * @summary Returns compatible primary versions for a supplied secondary version.
 *
 * @example
 * var VersionCompatibility = require('../lib/versions');
 *
 * var compatibilityMatrix = {
 *     '1.0.0': '2.4.x',
 *     '1.1.0': '2.4.x',
 *     '1.1.3': '2.4.7 - 2.4.x',
 *     '1.2.0': '2.5.x'
 * };
 *
 * var versions = VersionCompatibility(compatibilityMatrix);
 *
 * versions.compatibilityMatrix; // { '1.0.0': '>=2.4.0-0', '1.1.0': '>=2.4.0-0', '1.1.3': '>=2.4.7 <2.5.0-0', '1.2.0': '>=2.5.0-0'}
 *
 * versions.all(); // ['1.0.0','1.1.0','1.1.3','1.2.0']
 *
 * versions.compatibleWith('2.4.3'); // ['1.0.0','1.1.0']
 * versions.compatibleWith('2.4.8'); // ['1.1.3']
 * versions.compatibleWith('2.5.3'); // ['1.2.0']
 * versions.compatibleWith('3.0.0'); // []
 *
 * versions.recommendedFor('2.4.3'); // '1.1.0'
 * versions.recommendedFor('2.4.8'); // '1.1.3'
 * versions.recommendedFor('2.5.3'); // '1.2.0'
 * versions.recommendedFor('3.0.0'); // Null
 *
 * @param compatibilityMatrix {Object.<string,string>} - Object with primary versions as keys, and compatibility range as value.
 *
 * @throws Error('compatibilityMatrix is a required parameter')
 * @throws Error('compatibilityMatrix must be an object')
 * @throws Error("'"+rangeString+"' is not a valid semantic version range")
 * @throws Error("'"+version+"' is not a valid semantic version number")
 *
 * @version 1.0.0
 * @constructor
 */
var VersionCompatibility = function(compatibilityMatrix){

    /**
     * **Description:**
     *
     * Sets a new compatibility matrix for the current instance.
     * @example
     * var Version = require('../lib/versions');
     *
     * var versions = VersionCompatibility({
     *     '1.0.0': '2.4.x',
     *     '1.1.0': '2.4.x',
     *     '1.1.3': '2.4.7 - 2.4.x',
     *     '1.2.0': '2.5.x'
     * });
     *
     * versions.compatibilityMatrix; // { '1.0.0': '>=2.4.0-0', '1.1.0': '>=2.4.0-0', '1.1.3': '>=2.4.7 <2.5.0-0', '1.2.0': '>=2.5.0-0'}
     *
     * versions.setCompatibilityMatrix({
     *     '2.0.0': '3.4.x',
     *     '2.1.0': '3.4.x',
     *     '2.1.3': '3.4.7 - 3.4.x',
     *     '2.2.0': '3.5.x'
     * });
     *
     * versions.compatibilityMatrix; // { '2.0.0': '>=3.4.0-0', '2.1.0': '>=3.4.0-0', '2.1.3': '>=3.4.7 <2.5.0-0', '2.2.0': '>=3.5.0-0'}
     *
     * @param newCompatibilityMatrix {Object.<string,string>} - Object with primary versions as keys, and compatibility range as value.
     */
    this.setCompatibilityMatrix = function(newCompatibilityMatrix){
        compatibilityMatrix = sanitizeAndValidateCompatibilityMatrix(newCompatibilityMatrix);
    };

    /**
     * **Description:**
     *
     * Returns all sanitized primary version numbers from the compatibility matrix
     * @example
     * var Version = require('../lib/versions');
     *
     * var versions = VersionCompatibility({
     *     '1.0.0': '2.4.x',
     *     '1.1.0': '2.4.x',
     *     '1.1.3': '2.4.7 - 2.4.x',
     *     '1.2.0': '2.5.x'
     * });
     *
     * versions.all(); // ['1.0.0','1.1.0','1.1.3','1.2.0']
     *
     * @returns {Array.<string>}
     */
    this.all = function(){
        return _.keys(compatibilityMatrix);
    };

    /**
     * **Description:**
     *
     * Returns all primary versions that are compatible with the secondary version provided.
     *
     * @example
     * var Version = require('../lib/versions');
     *
     * var versions = VersionCompatibility({
     *     '1.0.0': '2.4.x',
     *     '1.1.0': '2.4.x',
     *     '1.1.3': '2.4.7 - 2.4.x',
     *     '1.2.0': '2.5.x'
     * });
     *
     * versions.compatibleWith('2.4.3'); // ['1.0.0','1.1.0']
     * versions.compatibleWith('2.4.8'); // ['1.1.3']
     * versions.compatibleWith('2.5.3'); // ['1.2.0']
     * versions.compatibleWith('3.0.0'); // []
     *
     * @param version {String} - Secondary version to get all compatible primary versions of
     * @returns {Array}
     */
    this.compatibleWith = function(version){
        var compatibleVersions = [];
        _.each(compatibilityMatrix,function(compatibleRange,primaryVersion){
            if(semver.satisfies(version,compatibleRange)){
                compatibleVersions.push(primaryVersion);
            }
        });
        return compatibleVersions.sort(semver.rcompare);
    };

    /**
     * **Description:**
     *
     * Returns the highest compatible version for the secondary version provided, or null if none match
     *
     * @example
     * var Version = require('../lib/versions');
     *
     * var versions = VersionCompatibility({
     *     '1.0.0': '2.4.x',
     *     '1.1.0': '2.4.x',
     *     '1.1.3': '2.4.7 - 2.4.x',
     *     '1.2.0': '2.5.x'
     * });
     *
     * versions.recommendedFor('2.4.3'); // '1.1.0'
     * versions.recommendedFor('2.4.8'); // '1.1.3'
     * versions.recommendedFor('2.5.3'); // '1.2.0'
     * versions.recommendedFor('3.0.0'); // Null
     *
     * @param version {String} - Secondary version to get the highest compatible primary version of
     * @returns {string|Null}
     */
    this.recommendedFor = function(version){
        var compatibleVersions = this.compatibleWith(version);
        return compatibleVersions ? compatibleVersions[0] : null;
    };

    /**
     * Read-only public access to the compatibilityMatrix, currently to prevent re-setting the matrix
     * @type {Object}
     * @readonly
     */
    this.__defineGetter__('compatibilityMatrix',function(){ return compatibilityMatrix; });

    /* Private Methods */

    var sanitizeAndValidateCompatibilityMatrix = function(compatibilityMatrix){
        if(!compatibilityMatrix){throw new Error('compatibilityMatrix is a required parameter')}
        if(!_.isObject(compatibilityMatrix) || _.isArray(compatibilityMatrix) || _.isFunction(compatibilityMatrix)){
            throw new Error('compatibilityMatrix must be an object with keys of versions numbers, and values of version ranges');
        }
        var sanitizedCompatibilityMatrix = {};
        _.each(compatibilityMatrix,function(compatibleRange,primaryVersion){
            var sanitizedPrimaryVersion = sanitizeAndValidateVersion(primaryVersion);
            var sanitizedCompatibleRange = sanitizeAndValidateRange(compatibleRange);
            sanitizedCompatibilityMatrix[sanitizedPrimaryVersion] = sanitizedCompatibleRange;
        },this);
        return sanitizedCompatibilityMatrix;
    };

    var sanitizeAndValidateVersion = function(version){
        var sanitizedVersion = semver.clean(version);
        if(!sanitizedVersion){throw new Error("'"+version+"' is not a valid semantic version number")}
        return sanitizedVersion
    };

    var sanitizeAndValidateRange = function(rangeString){
        var sanitizedVersion = semver.validRange(rangeString);
        if(!sanitizedVersion){throw new Error("'"+rangeString+"' is not a valid semantic version range")}
        return sanitizedVersion
    };

    /* Initializer */
    this.setCompatibilityMatrix(compatibilityMatrix);

};
module.exports = VersionCompatibility;