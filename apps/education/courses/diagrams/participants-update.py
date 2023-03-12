from diagrams import Diagram
from diagrams.aws.compute import LambdaFunction
from diagrams.aws.integration import EventbridgeCustomEventBusResource, SimpleQueueServiceSqs
from diagrams.aws.database import Dynamodb

graph_attr = {
    "pad": "0.75",
}

with Diagram("Update participants", show=False, filename="participants-update", direction="TB", graph_attr=graph_attr):
  int_event_bus_course_updated = EventbridgeCustomEventBusResource("INT\ncourse\nupdated")
  int_event_bus_member_updated = EventbridgeCustomEventBusResource("INT\nmember\nupdated")
  int_event_bus_participant_updated = EventbridgeCustomEventBusResource("INT\nparticipant\nupdated")
  sqs_participant_update = SimpleQueueServiceSqs("participant-update")
  lambda_participant_update = LambdaFunction("participant-update")
  lambda_participant_update_multi = LambdaFunction("participant-update-multi")
  ddb_courses = Dynamodb("courses")

  int_event_bus_course_updated >> lambda_participant_update_multi
  int_event_bus_member_updated >> lambda_participant_update_multi
  lambda_participant_update_multi >> sqs_participant_update
  sqs_participant_update >> lambda_participant_update
  lambda_participant_update >> ddb_courses
  lambda_participant_update >> int_event_bus_participant_updated

