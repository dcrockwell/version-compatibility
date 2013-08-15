# VersionCompatibility.js

Takes a matrix of primary semantic version numbers that are correlated with secondary semantic version ranges then
allows you to quickly determine compatibility between the two sets of version numbers.

## Example

    var VersionCompatibility = require('version-compatibility');

    // The key is the module version number
    // The value is the range of system versions that are compatible with the module version number
    var compatibilityMatrix = {
        '1.0.0': '2.4.x',
        '1.1.0': '2.4.x',
        '1.1.3': '2.4.7 - 2.4.x',
        '1.2.0': '2.5.x'
    };

    var versions = VersionCompatibility(compatibilityMatrix);

    versions.compatibilityMatrix;
    // { '1.0.0': '>=2.4.0-0', '1.1.0': '>=2.4.0-0', '1.1.3': '>=2.4.7 <2.5.0-0', '1.2.0': '>=2.5.0-0'}

    versions.all();
    // ['1.0.0','1.1.0','1.1.3','1.2.0']

    versions.compatibleWith('2.4.3'); // ['1.0.0','1.1.0']
    versions.compatibleWith('2.4.8'); // ['1.1.3']
    versions.compatibleWith('2.5.3'); // ['1.2.0']
    versions.compatibleWith('3.0.0'); // []

    versions.recommendedFor('2.4.3'); // '1.1.0'
    versions.recommendedFor('2.4.8'); // '1.1.3'
    versions.recommendedFor('2.5.3'); // '1.2.0'
    versions.recommendedFor('3.0.0'); // Null

## Running The Spec

You can run the spec for version-compatibility via:

    $ npm test