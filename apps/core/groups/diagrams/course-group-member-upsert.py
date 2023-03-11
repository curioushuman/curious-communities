from diagrams import Diagram
from diagrams.aws.compute import LambdaFunction
from diagrams.aws.integration import EventbridgeCustomEventBusResource
from diagrams.aws.database import Dynamodb

graph_attr = {
    "overlap": "false"
}

with Diagram("Create/update course group member", show=False, filename="course-group-member-upsert", direction="TB", graph_attr=graph_attr):
  int_event_bus_participant_created = EventbridgeCustomEventBusResource("INT\nparticipant\ncreated")
  int_event_bus_participant_updated = EventbridgeCustomEventBusResource("INT\nparticipant\nupdated")
  int_event_bus_course_group_member_created = EventbridgeCustomEventBusResource("INT\ncourse-group-member\ncreated")
  int_event_bus_course_group_member_updated = EventbridgeCustomEventBusResource("INT\ncourse-group-member\nupdated")
  lambda_course_group_member_upsert = LambdaFunction("course-group-member-upsert")
  ddb_groups = Dynamodb("groups")

  int_event_bus_participant_created >> lambda_course_group_member_upsert
  int_event_bus_participant_updated >> lambda_course_group_member_upsert
  lambda_course_group_member_upsert >> int_event_bus_course_group_member_created
  lambda_course_group_member_upsert >> int_event_bus_course_group_member_updated
  lambda_course_group_member_upsert >> ddb_groups
