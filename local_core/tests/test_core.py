"""Offline tests for the private AI agent's project tools and safety boundaries."""
import base64
import copy
import json
import pathlib
import sys
import unittest
from unittest.mock import patch

sys.path.insert(0,str(pathlib.Path(__file__).resolve().parents[1]))
import core

def project():
    return {"format":"spectra-studio","version":1,"name":"Test Project","duration":8,"bpm":120,
            "emitters":[],"sounds":[],"settings":{"grid":True,"background":"studio"}}

class ProjectToolsTest(unittest.TestCase):
    def test_blank_effect_and_audio_creation(self):
        p=project();pending=[]
        e=core.apply_tool(p,"add_effect",{"name":"Blue Sparks","settings":{
            "rate":80,"shape":"disc","sprite":"spark","colorStart":"#88CCFF",
            "gravity":-2.5,"life":.35}},pending)
        s=core.apply_tool(p,"add_sound",{"name":"Electric Crackle","settings":{
            "kind":"noise","noise":.85,"duration":1,"freq":400}},pending)
        self.assertEqual(len(p["emitters"]),1)
        self.assertEqual(len(p["sounds"]),1)
        self.assertEqual(len(pending),2)
        self.assertEqual(e["created"]["colorStart"],"#88ccff")
        self.assertEqual(s["created"]["kind"],"noise")
        self.assertNotEqual(e["created"]["id"],s["created"]["id"])
        self.assertEqual(e["created"]["rate"],80)

    def test_layer_edits_and_deletions_require_valid_ids(self):
        p=project();log=[]
        e=core.apply_tool(p,"add_effect",{"name":"Smoke"},log)["created"]
        core.apply_tool(p,"edit_layer",{"kind":"emitter","id":e["id"],"updates":{"rate":200,"life":4}},log)
        self.assertEqual(p["emitters"][0]["rate"],200)
        with self.assertRaises(core.AgentError):
            core.apply_tool(p,"edit_layer",{"kind":"emitter","id":"missing","updates":{"rate":1}},log)
        core.apply_tool(p,"delete_layer",{"kind":"emitter","id":e["id"]},log)
        self.assertFalse(p["emitters"])

    def test_rejects_injection_and_invalid_fields(self):
        for settings in ({"textureId":"file:///secret"},{"sample":"/etc/passwd"},
                         {"rate":float("nan")},{"colorStart":"red"},{"wave":"invalid"}):
            with self.assertRaises(core.AgentError):
                core.sanitize_updates("emitter",settings)
        with self.assertRaises(core.AgentError):
            core._public_address("http://127.0.0.1/admin")
        with self.assertRaises(core.AgentError):
            core._public_address("https://localhost/secret")
        with self.assertRaises(core.AgentError):
            core._public_address("https://127.0.0.1:443/file")

    def test_tool_side_effects_are_proposals(self):
        original=project();draft=copy.deepcopy(original);log=[]
        core.apply_tool(draft,"add_sound",{"name":"Mechanical Rumble"},log)
        self.assertEqual(original["sounds"],[])
        self.assertEqual(len(draft["sounds"]),1)

    def test_rejects_excessive_layers(self):
        p=project();p["emitters"]=[{"id":str(i)} for i in range(50)]
        with self.assertRaises(core.AgentError):
            core.apply_tool(p,"add_effect",{"name":"Extra"},[])

    def test_image_reference_data_and_invalid_formats(self):
        ref={"mime":"image/png","data":base64.b64encode(b"\x89PNG\r\n").decode()}
        info,frames=core.prepare_media(ref)
        self.assertEqual(info["type"],"image")
        self.assertEqual(len(frames),1)
        with self.assertRaises(core.AgentError):
            core.prepare_media({"mime":"application/x-msdownload","data":ref["data"]})

    def test_model_tool_calls_build_a_draft_without_modifying_input(self):
        request=project()
        calls=[{"function":{"name":"add_effect","arguments":{"name":"Plasma Arc","settings":{
            "rate":44,"sprite":"spark","colorStart":"#80ccff"}}}},
            {"function":{"name":"add_sound","arguments":{"name":"Arc Snap","settings":{
            "wave":"square","freq":980,"noise":.4}}}}]
        answers=[
            {"message":{"role":"assistant","content":"","tool_calls":calls}},
            {"message":{"role":"assistant","content":"Created an editable arc and a synchronized sound."}}]
        def mock_ollama(*args,**kwargs):return answers.pop(0)
        with patch.object(core,"models",return_value=["qwen3:4b"]),patch.object(core,"_post_ollama",side_effect=mock_ollama):
            result=core.run_agent({"prompt":"Make an electrical effect","model":"qwen3:4b",
                                   "project":request,"allowWeb":False})
        self.assertEqual(len(result["changes"]),2)
        self.assertEqual(result["project"]["emitters"][0]["name"],"Plasma Arc")
        self.assertEqual(result["project"]["sounds"][0]["name"],"Arc Snap")
        self.assertEqual(request["emitters"],[])
        self.assertEqual(request["sounds"],[])
        self.assertIn("editable arc",result["reply"])

    def test_invalid_project_rejected(self):
        with self.assertRaises(core.AgentError):
            core.sanitized_project({"format":"untrusted","emitters":[],"sounds":[]})

if __name__=="__main__":unittest.main()
