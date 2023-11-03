const { AwsGuard } = require('@pulumi/awsguard');

new AwsGuard({ all: 'mandatory' });

// const policy = require('@pulumi/policy');
//
// new policy.PolicyPack('tests-pack', {
//   policies: [
//     {
//       description: 'always deny',
//       enforcementLevel: 'mandatory',
//       name: 'test',
//       validateStack: (args, reportViolation) => {
//         reportViolation('This is a test violation');
//       },
//     },
//   ],
// });
