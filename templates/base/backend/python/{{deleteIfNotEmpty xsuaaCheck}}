from functools import wraps
from flask import make_response, request, jsonify
# Cloud Foundry
from cfenv import AppEnv
env = AppEnv()

# get the xsuaa service
from sap import xssec
UAA_SERVICE_LABEL = 'xsuaa'
xsuaa_service = env.get_service(label=UAA_SERVICE_LABEL).credentials

# Authentication decorator
def auth(scopes):
    def decorator(f):
        def wrapper(*args, **kwargs):
            access_token = None
            security_context = None
            scopes_list = scopes.split(',')
            is_authorized = False
            
            # ensure the authorization header is passed with the headers
            if 'authorization' not in request.headers:
                return make_response(jsonify({"message": "Authorization header is missing!"}), 401)

            # fetch the token from the authorization header
            access_token = request.headers.get('authorization')[7:]

            try:
                # fetch the security context from the token
                security_context = xssec.create_security_context(access_token, xsuaa_service)
            except Exception as e:
                return make_response(jsonify({"message": str(e)}), 500)

            if len(scopes_list) > 0:
                for scope in scopes_list:
                    if not security_context.check_local_scope(scope):
                        return make_response(jsonify({"message": "Forbidden"}), 403)
                is_authorized = True
            else:
                is_authorized = security_context.check_scope('openid')
            if not is_authorized:
                return make_response(jsonify({"message": "Forbidden"}), 403)

            # Return the user information attached to the token
            return f(security_context.get_email(), *args, **kwargs)
        return wrapper
    return decorator