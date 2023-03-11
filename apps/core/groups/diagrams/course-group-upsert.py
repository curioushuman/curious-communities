from diagrams import Diagram
from diagrams.aws.compute import LambdaFunction
from diagrams.aws.integration import EventbridgeCustomEventBusResource
from diagrams.aws.database import Dynamodb

graph_attr = {
    "overlap": "false"
}

with Diagram("Create/update course group", show=False, filename="course-group-upsert", direction="TB", graph_attr=graph_attr):
  int_event_bus_course_created = EventbridgeCustomEventBusResource("INT\ncourse\ncreated")
  int_event_bus_course_updated = EventbridgeCustomEventBusResource("INT\ncourse\nupdated")
  int_event_bus_course_group_created = EventbridgeCustomEventBusResource("INT\ncourse-group\ncreated")
  int_event_bus_course_group_updated = EventbridgeCustomEventBusResource("INT\ncourse-group\nupdated")
  lambda_course_group_upsert = LambdaFunction("course-group-upsert")
  ddb_groups = Dynamodb("groups")

  int_event_bus_course_created >> lambda_course_group_upsert
  int_event_bus_course_updated >> lambda_course_group_upsert
  lambda_course_group_upsert >> int_event_bus_course_group_created
  lambda_course_group_upsert >> int_event_bus_course_group_updated
  lambda_course_group_upsert >> ddb_groups
