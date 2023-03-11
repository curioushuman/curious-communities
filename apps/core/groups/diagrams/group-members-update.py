from diagrams import Diagram
from diagrams.aws.compute import LambdaFunction
from diagrams.aws.integration import EventbridgeCustomEventBusResource, SimpleQueueServiceSqs
from diagrams.aws.database import Dynamodb

graph_attr = {
    "overlap": "false"
}

with Diagram("Update group members", show=False, filename="group-members-update", direction="TB", graph_attr=graph_attr):
  int_event_bus_group_updated = EventbridgeCustomEventBusResource("INT\ngroup\nupdated")
  int_event_bus_member_updated = EventbridgeCustomEventBusResource("INT\nmember\nupdated")
  int_event_bus_group_member_updated = EventbridgeCustomEventBusResource("INT\ngroup-member\nupdated")
  sqs_group_member_update = SimpleQueueServiceSqs("group-member-update")
  lambda_group_member_update = LambdaFunction("group-member-update")
  lambda_group_member_update_multi = LambdaFunction("group-member-update-multi")
  ddb_groups = Dynamodb("groups")

  int_event_bus_group_updated >> lambda_group_member_update_multi
  int_event_bus_member_updated >> lambda_group_member_update_multi
  lambda_group_member_update_multi >> sqs_group_member_update
  sqs_group_member_update >> lambda_group_member_update
  lambda_group_member_update >> ddb_groups
  lambda_group_member_update >> int_event_bus_group_member_updated

