from diagrams import Diagram
from diagrams.aws.compute import LambdaFunction
from diagrams.aws.integration import EventbridgeCustomEventBusResource
from diagrams.aws.database import Dynamodb

graph_attr = {
    "overlap": "false"
}

with Diagram("Update course", show=False, filename="course-update", direction="TB", graph_attr=graph_attr):
  ext_event_bus = EventbridgeCustomEventBusResource("EXT\ncourse\nupdated")
  int_event_bus_course_created = EventbridgeCustomEventBusResource("INT\ncourse\ncreated")
  int_event_bus_course_updated = EventbridgeCustomEventBusResource("INT\ncourse\nupdated")
  lambda_course_upsert = LambdaFunction("course-upsert")
  ddb_courses = Dynamodb("courses")

  ext_event_bus >> lambda_course_upsert
  lambda_course_upsert >> int_event_bus_course_created
  lambda_course_upsert >> int_event_bus_course_updated
  lambda_course_upsert >> ddb_courses
