import React from "react";
import { useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import BackendService from "../services/BackendService";
import EnvConfig from "../services/EnvConfig";
import TextField from "../components/TextField";
import Button from "../components/Button";
import Breadcrumbs from "../components/Breadcrumbs";

interface FormValues {
  name: string;
  topicAreaId: string;
  description: string;
}

function CreateTopicArea() {
  const history = useHistory();
  const { register, errors, handleSubmit } = useForm<FormValues>();

  const onSubmit = async (values: FormValues) => {
    const topicarea = await BackendService.createTopicArea(values.name);

    history.push("/admin/settings/topicarea", {
      alert: {
        type: "success",
        message: `"${
          topicarea.name
        }" ${EnvConfig.topicAreaLabel.toLowerCase()} successfully created`,
      },
    });
  };

  const onCancel = () => {
    history.push("/admin/settings/topicarea");
  };

  return (
    <>
      <Breadcrumbs
        crumbs={[
          {
            label: "Settings",
            url: "/admin/settings/topicarea",
          },
          {
            label: EnvConfig.topicAreasLabel,
            url: "/admin/settings/topicarea",
          },
          {
            label: `Create new ${EnvConfig.topicAreaLabel.toLowerCase()}`,
          },
        ]}
      />
      <h1>{`Create new ${EnvConfig.topicAreaLabel.toLowerCase()}`}</h1>

      <div className="grid-row">
        <div className="grid-col-12">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="usa-form usa-form--large"
            data-testid="CreateTopicAreaForm"
          >
            <TextField
              id="name"
              name="name"
              label={`${EnvConfig.topicAreaLabel} name`}
              register={register}
              error={errors.name && "Please specify a name"}
              required
            />

            <br />
            <Button type="submit">{`Create ${EnvConfig.topicAreaLabel.toLowerCase()}`}</Button>
            <Button
              className="margin-left-1 text-base-dark hover:text-base-darker active:text-base-darkest"
              variant="unstyled"
              type="button"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}

export default CreateTopicArea;
