import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set

const jwksUrl = `-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJLbYuKViKvbkYMA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
BAMTIWRldi1udGo4eHFneXZjaGJoeDgwLnVzLmF1dGgwLmNvbTAeFw0yMjExMTUx
NDU3MDlaFw0zNjA3MjQxNDU3MDlaMCwxKjAoBgNVBAMTIWRldi1udGo4eHFneXZj
aGJoeDgwLnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBANrBX95NoxklEOtosP6fQYW/WYFBIstqD6XRFmmBGawTUqSh3CmAak80wA8A
yKCkCD1nsiE5sqV6bIan5AoMwUV4BjUByaIBKFqMXOBc5NtMhGp0A/AZ4DKIzawW
gwAtedtPY7YxKBcMqNTzw7m14KsPOSW0fH+OMis/BjlayFd1MlQd3333Fh+rBkmk
H9a82V9QaekFEP6ind7rPCk/qDOPYX1a/3tqEYb+F9PpvM2f7o3lMvIyazKe9Bj6
6q0mrBEak92MGbtpe7lE9Ilic8KA0tRuBdRe44Dt3j/jCRSyz8dt9rzawCZ4WBQe
L4Xt/5h73D0+vyvCuD5DJQ+OO5cCAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQUJf87AjP+rdxaG3pqgh9vzgrM430wDgYDVR0PAQH/BAQDAgKEMA0G
CSqGSIb3DQEBCwUAA4IBAQAEioyLWhDHbYPohLgPUe8zQ4VPAroEW8hreTz0skhK
0NKFFhChqfuOg0moa0rGlQcobEPfReGyBocNtfNbV7ixFh122DbD1taaKmbcKwRn
EIggUpATFGk7kXodZDsPIbs1TWYDdO1pf8MeghhK4PSpvOQARBCF2rV5Zecd2yvy
CfXOOKKSaWqjj50torsAB+RY0TsSfhGhU0R2PmQGzTh2yLLV7LYudiWuVb63wgSX
6f4PGeEXN9B+RKZI8EgDkcAHsObnMpQgV/IM3cUhAL/rjtk26YVnF7bi5S6ye8sh
cezELUA51igTzzmyrqQ6CNJ+W4AujNb3HYtHkJJd9IQl
-----END CERTIFICATE-----`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  //const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  return verify(token, jwksUrl, { algorithms:['RS256'] }) as JwtPayload;
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}