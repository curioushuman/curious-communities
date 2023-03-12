from diagrams import Diagram
from diagrams.aws.compute import LambdaFunction
from diagrams.aws.integration import EventbridgeCustomEventBusResource, StepFunctions
from diagrams.aws.database import Dynamodb

graph_attr = {
    "pad": "0.75",
}

with Diagram("Create member", show=False, filename="member-create", direction="TB", graph_attr=graph_attr):
  ext_event_bus = EventbridgeCustomEventBusResource("EXT\nmember\ncreated")
  int_event_bus_member_created = EventbridgeCustomEventBusResource("INT\nmember\ncreated")
  int_event_bus_member_updated = EventbridgeCustomEventBusResource("INT\nmember\nupdated")
  lambda_member_create = LambdaFunction("member-create")
  lambda_member_upsert = LambdaFunction("member-upsert\n(TBD)")
  sfn_participant_upsert = StepFunctions("participant-upsert")
  ddb_members = Dynamodb("members")

  sfn_participant_upsert >> lambda_member_create
  lambda_member_create >> int_event_bus_member_created
  lambda_member_create >> ddb_members

  ext_event_bus >> lambda_member_upsert
  lambda_member_upsert >> int_event_bus_member_created
  lambda_member_upsert >> int_event_bus_member_updated
  lambda_member_upsert >> ddb_members
