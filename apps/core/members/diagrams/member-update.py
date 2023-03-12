from diagrams import Diagram
from diagrams.aws.compute import LambdaFunction
from diagrams.aws.integration import EventbridgeCustomEventBusResource
from diagrams.aws.database import Dynamodb

graph_attr = {
    "pad": "0.75",
}

with Diagram("Update member", show=False, filename="member-update", direction="TB", graph_attr=graph_attr):
  ext_event_bus = EventbridgeCustomEventBusResource("EXT\nmember\nupdated")
  int_event_bus_member_created = EventbridgeCustomEventBusResource("INT\nmember\ncreated")
  int_event_bus_member_updated = EventbridgeCustomEventBusResource("INT\nmember\nupdated")
  lambda_member_update = LambdaFunction("member-update")
  ddb_members = Dynamodb("members")

  ext_event_bus >> lambda_member_update
  lambda_member_update >> int_event_bus_member_created
  lambda_member_update >> int_event_bus_member_updated
  lambda_member_update >> ddb_members

