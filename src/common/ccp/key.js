import angular from 'angular';

let constantName = 'ccpKey';
let key = '-----BEGIN PUBLIC KEY-----' +
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAiiBT37BsBVBgKfF6z78X' +
  'lOl73+HexgTND1Z7qCIScFPSRlQd+svsYah7kQKjNFGPYvz9dmBgNKq1EmdML2nz' +
  'iRDAsBRR14OW4P8v2EjaMDGoOc+SwOJcyfoU6iBFkjwrUzlk8SXK07k3hgrtugCB' +
  'WEEfDuZOA+2DR0ydRzT1p+nbVg9+HnpnKE3JQWG7M8Czy0+U085gReKq0C0xcJ+G' +
  's4vBUiO0JWYsmRODBGspkOi9jO/+mZVflmPd5Zvf4l8MwA3A9emHF4tet4WxIAWP' +
  'Y9trU+GPuZuYRbnDPB7SmPR5DWSZzmbyJXdFaLxn/Q5a0lRt4AzCmUPLbAz4/Mip' +
  'swIDAQAB' +
  '-----END PUBLIC KEY-----';

export default angular
  .module(constantName, [])
  .constant(constantName, key);
