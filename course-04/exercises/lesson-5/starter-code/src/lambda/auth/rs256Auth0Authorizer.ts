import {CustomAuthorizerEvent, CustomAuthorizerResult} from 'aws-lambda'
import 'source-map-support/register'
import {JwtToken} from "../../auth/JwtToken";
import {verify} from "jsonwebtoken";

const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJYjcyT+A5XLBWMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi03cHd3ZHR0Mi5ldS5hdXRoMC5jb20wHhcNMjAwNDI2MjAzNjQxWhcN
MzQwMTAzMjAzNjQxWjAkMSIwIAYDVQQDExlkZXYtN3B3d2R0dDIuZXUuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyNV7ccax1hkqrykT
UcuMP88kO42zjN4c553a2wxIIB/GKVipoCyFo4E3LjufIn5hmoONvu2NriUKj96d
SscAbx9mTTptbyE9xGSRZJADa2imA+fsvjGwbEWpqp8zCHM1Sb3gEriXlPImHH6w
Ypr62uayuoi9QKe8R19NqA88y7yOtDR41ymgmTAT93BBzWtVcUMja6/XFQW914Fc
tUU2pOCdtToCDwu9YjuB2s+WFFNupP/7hLxMyh7uPf6e67lwWDL3fpn+E8b1FmV+
YUeEjX3BrcUc8dwJGLqAFYfN4DFm4BFMHS3+1subOXxuvAWb26jLJHbrfTkFRWtU
FKVuywIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBQnuBTz2ivy
58yuBkIqztp+bv088DAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
ADphruzm6Lin/tbM6upImh0vJ0j1kMwCQx2/kiT7hEQD6n+CHFzIBgv8NeSZLrqX
95LsxoX3oeS7RE5rniqywUOzMkrANJjvK7IPJ9/c3jhNvQ5RvRVzNFY5sF0R/d+N
cFwyI3kB3o8pYHWZuDt+3I84vfWQxoFz3tqbncbfEwGDRghlOG0xdMTvPrFx5GwR
EcYd/P0at499Xf9ZsPCh2dXIKhlMiuvFAxb4RIQpaVMIv2R8oUON/w3sVaxguNph
sZatNyzlL++LjW7vmbr18iD13FVWYFl7c8zmnu9pd1XvQMe/RjitJt/mtov7n9gi
IVqwa0VfPvcqAFfXQag+b9M=
-----END CERTIFICATE-----`;

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
    try {
        const decodedToken = await verifyToken(event.authorizationToken);
        console.log('User was authorized', decodedToken);

        return {
            principalId: decodedToken.sub,
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
        console.log('User was not authorized', e.message);

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
};

async function verifyToken(authHeader: string): Promise<JwtToken> {
    if (!authHeader)
        throw new Error('No authentication header');

    if (!authHeader.toLowerCase().startsWith('bearer '))
        throw new Error('Invalid authentication header');

    const split = authHeader.split(' ');
    const token = split[1];

    return await verify(token, cert, {algorithms: ['RS256']}) as JwtToken;
}
