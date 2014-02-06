package de.uni_potsdam.hpi.metanome.frontend.client.runs;

import java.util.ArrayList;

import org.junit.Test;

import com.google.gwt.junit.client.GWTTestCase;

import de.uni_potsdam.hpi.metanome.frontend.client.BasePage;
import de.uni_potsdam.hpi.metanome.frontend.client.parameter.InputParameter;
import de.uni_potsdam.hpi.metanome.frontend.client.parameter.InputParameterCsvFile;
import de.uni_potsdam.hpi.metanome.frontend.client.parameter.InputParameterString;

/**
 * Tests for the algorithm specific pages (tabs)
 */
public class GwtTestRunConfigurationTab extends GWTTestCase {
	
	private BasePage page;

	@Test
	public void testConstruction(){
		//Execute
		RunConfigurationPage runConfigPage = new RunConfigurationPage(page);
		
		//Check - should contain the jarChooser and a Label for pre-selected data source (possibly empty)
		assertEquals(2, runConfigPage.getWidgetCount());
		assertTrue(runConfigPage.getJarChooser() instanceof JarChooser);
	}
	
	@Test
	public void testAddParameterTable(){
		//Setup
		RunConfigurationPage runConfigPage = new RunConfigurationPage(page);
		ArrayList<InputParameter> paramList = new ArrayList<InputParameter>();
		int widgetCount = runConfigPage.getWidgetCount();
				
		//Execute
		runConfigPage.addParameterTable(paramList);
				
		//Check
		assertEquals(widgetCount + 1, runConfigPage.getWidgetCount());
	}
	
	@Test
	public void testAddAlgorithms() {
		//Setup
		RunConfigurationPage runConfigPage = new RunConfigurationPage(page);
		int noOfAlgorithms = runConfigPage.getJarChooser().getListItemCount();
		
		//Execute
		runConfigPage.addAlgorithms("Additional 1", "Additional 2");
		
		//Check
		assertEquals(noOfAlgorithms + 2, runConfigPage.getJarChooser().getListItemCount());
	}
	
	@Test
	public void testSelectAlgorithm() {
		//Setup
		RunConfigurationPage runConfigPage = new RunConfigurationPage(page);
		String algoName = setUpJarChooser(runConfigPage);
		
		//Execute
		runConfigPage.selectAlgorithm(algoName);
		
		//Check
		assertEquals(algoName, runConfigPage.getCurrentlySelectedAlgorithm());
	}

	
	@Test
	public void testForwardParamters() {
		//Setup
		RunConfigurationPage runConfigPage = new RunConfigurationPage(page);
		ArrayList<InputParameter> paramList = new ArrayList<InputParameter>();
		paramList.add(new InputParameterString("someString"));
		paramList.add(new InputParameterCsvFile("theDataSource"));
		
		//Execute
		runConfigPage.jarChooser.forwardParameters(paramList);
		
		//Check
		assertNotNull(runConfigPage.parameterTable);
	}

	protected String setUpJarChooser(RunConfigurationPage runConfigPage) {
		String algoName = "somethingRandom";
		runConfigPage.addAlgorithms("Additional 1", algoName, "Additional 2");
		assertEquals("--", runConfigPage.getCurrentlySelectedAlgorithm());
		return algoName;
	}

	@Override
	public String getModuleName() {
		return "de.uni_potsdam.hpi.metanome.frontend.Hello";
	}

}
