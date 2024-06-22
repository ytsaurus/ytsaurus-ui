container=${KEYCLOCK_CONTAINER:-keycloak}

run_cmd="docker exec $container"
run_cmd_i="docker exec -i $container"
run_cmd_it="docker exec -it $container"

for ((i = 30; i > 0; i--)); do
    if $run_cmd_it /opt/keycloak/bin/kcadm.sh config credentials --server http://localhost:8080 --realm master --user admin --password admin; then
        break
    else
        echo $i attempts left, sleep for one second before retry
    fi
done

$run_cmd /opt/keycloak/bin/kcadm.sh update realms/master -s sslRequired=NONE

$run_cmd /opt/keycloak/bin/kcadm.sh create realms -s realm=myrealm -s enabled=true
$run_cmd /opt/keycloak/bin/kcadm.sh update realms/myrealm -s sslRequired=NONE

$run_cmd /opt/keycloak/bin/kcadm.sh create users -r myrealm -s username=user -s enabled=true -s firstName=Foo -s lastName=Bar -s email=foo@bar
$run_cmd /opt/keycloak/bin/kcadm.sh set-password -r myrealm --username user --new-password 123123

$run_cmd_i /opt/keycloak/bin/kcadm.sh create clients -r myrealm -f - <<__EOF
{                    
    "clientId": "myclient",
    "name" : "",
    "description" : "",
    "rootUrl" : "",
    "adminUrl" : "",
    "baseUrl" : "",
    "surrogateAuthRequired" : false,
    "enabled" : true,
    "alwaysDisplayInConsole" : false,
    "clientAuthenticatorType" : "client-secret",
    "redirectUris" : [ "/*" ],
    "webOrigins" : [ "/*" ],
    "notBefore" : 0,
    "bearerOnly" : false,
    "consentRequired" : false,
    "standardFlowEnabled" : true,
    "implicitFlowEnabled" : false,
    "directAccessGrantsEnabled" : true,
    "serviceAccountsEnabled" : false,
    "publicClient" : true,
    "frontchannelLogout" : true,
    "protocol" : "openid-connect",
    "attributes" : {
        "oidc.ciba.grant.enabled" : "false",
        "backchannel.logout.session.required" : "true",
        "oauth2.device.authorization.grant.enabled" : "false",
        "display.on.consent.screen" : "false",
        "backchannel.logout.revoke.offline.tokens" : "false"
    },
    "authenticationFlowBindingOverrides" : { },
    "fullScopeAllowed" : true,
    "nodeReRegistrationTimeout" : -1,
    "defaultClientScopes" : [ "web-origins", "acr", "roles", "profile", "basic", "email" ],
    "optionalClientScopes" : [ "address", "phone", "offline_access", "microprofile-jwt" ],
    "access" : {
        "view" : true,
        "configure" : true,
        "manage" : true
    }
}
__EOF
