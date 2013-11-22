package de.uni_potsdam.hpi.metanome.frontend.client.widgets;

import com.google.gwt.user.client.ui.CheckBox;

import de.uni_potsdam.hpi.metanome.frontend.client.parameter.InputParameter;
import de.uni_potsdam.hpi.metanome.frontend.client.parameter.InputParameterBoolean;

public class InputParameterBooleanWidget extends CheckBox implements InputParameterWidget {
	
	private InputParameterBoolean inputParameter;

	public InputParameterBooleanWidget(
			InputParameterBoolean inputParameter) {
		super();
		this.inputParameter = inputParameter;
	}

	@Override
	public InputParameter getInputParameter() {
		this.inputParameter.setValue(this.getValue());
		return inputParameter;
	}

}
