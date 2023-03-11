from diagrams import Cluster, Diagram
from diagrams.aws.compute import LambdaFunction
from diagrams.aws.integration import EventbridgeCustomEventBusResource

graph_attr = {
    "overlap": "false"
}

with Diagram("Participant created/updated", show=False, filename="participant-upserted", direction="TB", graph_attr=graph_attr):
  ext_event_bus = EventbridgeCustomEventBusResource("EXT\nparticipant\ncreated")

  with Cluster("Upsert participant state machine"):
    int_event_bus_participant_created = EventbridgeCustomEventBusResource("INT\nparticipant\ncreated")
    int_event_bus_participant_updated = EventbridgeCustomEventBusResource("INT\nparticipant\nupdated")
    int_event_bus_member_created = EventbridgeCustomEventBusResource("INT\nmember\ncreated")
    lambda_course_find = LambdaFunction("course-find")
    lambda_participant_find = LambdaFunction("participant-find")
    lambda_participant_source_find = LambdaFunction("participant-source-find")
    lambda_participant_create = LambdaFunction("participant-create")
    lambda_participant_update = LambdaFunction("participant-update")
    lambda_member_find = LambdaFunction("member-find")
    lambda_member_create = LambdaFunction("member-create")

  ext_event_bus >> lambda_participant_find
  lambda_participant_find >> lambda_participant_update
  lambda_participant_update >> int_event_bus_participant_updated

  lambda_participant_find >> lambda_participant_source_find
  lambda_participant_source_find >> lambda_course_find
  lambda_course_find >> lambda_member_find
  lambda_member_find >> lambda_member_create
  lambda_member_create >> int_event_bus_member_created
  int_event_bus_member_created >> lambda_participant_create

  lambda_member_find >> lambda_participant_create
  lambda_participant_create >> int_event_bus_participant_created
