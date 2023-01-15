import re
import xmlrpc.client, json, sys

url = "https://umdxrclub.odoo.com"
db = "umdxrclub"
password = "5c2b759becc92894a7625a29ce5f96456bd6ad78"
common = xmlrpc.client.ServerProxy('{}/xmlrpc/2/common'.format(url))
uid = 2

def exec_kw(model, method, args, kwargs = {}):
    models = xmlrpc.client.ServerProxy('{}/xmlrpc/2/object'.format(url))
    return models.execute_kw(db, uid, password, model, method, args, kwargs)

def search_email(email):
    return exec_kw("res.partner", "name_search", [], {
    "name": email,
    "args": [],
    "operator":"ilike",
    "limit":1
})

def create_email(name, email):
    return exec_kw("res.partner", "create", [{"name": name, "email": email}])

def find_or_create_partner_id(name, email):
    partners = search_email(email)
    if len(partners) > 0:
        return partners[0][0]
    else:
        return create_email(name, email)

def create_sign_request(template_id, partner_id, subject, filename):
    args = {
        "template_id": int(template_id),
        "signer_ids": [[0, "virtual_1", { "role_id": 1, "partner_id": partner_id } ]],
        "signer_id": False,
        "signers_count": 1,
        "has_default_template": True,
        "follower_ids": [[ 6, False, [  ] ]], # 1 designates the XR Club account CC
        "subject": subject,
        "filename": filename,
        "refusal_allowed": False,
        "message_cc": "<p><br></p>",
        "attachment_ids": [[ 6, False, [] ]],
        "message": "<p><br></p>"
    }

    return exec_kw("sign.send.request", "create", [args])

def send_sign_request(request_id):
    try:
        exec_kw("sign.send.request", "send_request", [[request_id]])
    except xmlrpc.client.Fault as e:
        if not ("cannot marshal None unless allow_none is enabled" in e.faultString):
            raise e

def get_signers(template_id, email = None):
    filters = [["template_id.id", "in", [template_id]], ["state", "=", "signed"]]
    
    # todo: fix email filter
    # if email is not None:
    #     filters.append([("request_item_infos.partner_name", "=", email)])

    params = [["&", *filters]]
    results = [ item["request_item_infos"][0] for item in exec_kw("sign.request", "search_read", params, {"fields": ["request_item_infos"]})]
    return results

def show_usage():
    print ("usage: odoo.py get_signers [template_id] [email?]")
    print ("       odoo.py send [template_id] [name] [email] [subject] [filename]")

if len(sys.argv) <= 2:
    show_usage()
else:
    cmd = sys.argv[1]
    num_args = len(sys.argv) - 2
    if cmd == "get_signers" and (num_args == 1 or num_args == 2):
        template_id = sys.argv[2]
        email = None
        if (num_args == 2):
            email = sys.argv[3]
        print (json.dumps(get_signers(template_id, email=email)))
    elif cmd == "send" and len(sys.argv) == 7:
        template_id = sys.argv[2]
        name = sys.argv[3]
        email = sys.argv[4]
        subject = sys.argv[5]
        filename = sys.argv[6]

        partner_id = find_or_create_partner_id(name, email)
        request_id = create_sign_request(template_id, partner_id, subject, filename)
        send_sign_request(request_id)
        print ("{}")
    else:
        show_usage()


